import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FHIR_HEADERS = {
  'Content-Type': 'application/fhir+json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-FHIR-Version': '4.0.1'
}

function fhirError(status: number, code: string, text: string) {
  return Response.json({
    resourceType: 'OperationOutcome',
    issue: [{ severity: 'error', code, details: { text } }]
  }, { status, headers: FHIR_HEADERS })
}

export async function GET(request: NextRequest) {
  if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
    return fhirError(401, 'security', 'Missing Bearer token')
  }

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patient')
  const days      = parseInt(searchParams.get('days') || '30')
  if (!patientId) return fhirError(400, 'required', 'patient parameter required')

  // Lookup patient
  const { data: patient } = await supabase
    .from('fhir_patient_view')
    .select('fhir_id, oxc_id, supabase_id, given_name, conditions')
    .or(`fhir_id.eq.${patientId},oxc_id.eq.${patientId}`)
    .single()

  if (!patient) return fhirError(404, 'not-found', 'Patient not found')

  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)

  const { data: readings } = await supabase
    .from('care_readings')
    .select('ta_sys, ta_dia, glycemie, glycemie_type, heart_rate, weight, recorded_at, hba1c_lab')
    .eq('user_id', patient.supabase_id)
    .gte('recorded_at', dateFrom.toISOString())
    .order('recorded_at', { ascending: false })

  const obs = readings || []

  // Stats
  const taObs  = obs.filter(r => r.ta_sys && r.ta_dia)
  const glyObs = obs.filter(r => r.glycemie)

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

  const avgSys  = avg(taObs.map(r => r.ta_sys!))
  const avgDia  = avg(taObs.map(r => r.ta_dia!))
  const avgGly  = avg(glyObs.map(r => r.glycemie!))
  const minSys  = taObs.length ? Math.min(...taObs.map(r => r.ta_sys!)) : null
  const maxSys  = taObs.length ? Math.max(...taObs.map(r => r.ta_sys!)) : null
  const inTarget = taObs.filter(r => r.ta_sys! < 140 && r.ta_dia! < 90).length
  const pctTarget = taObs.length ? Math.round((inTarget / taObs.length) * 100) : null

  // HbA1c estimée (ADAG)
  const hba1cEst = avgGly ? parseFloat(((avgGly + 46.7) / 28.7).toFixed(1)) : null
  const hba1cLab = obs.find(r => r.hba1c_lab)?.hba1c_lab || null

  await supabase.from('fhir_audit_log').insert({
    action: 'read', resource_type: 'DiagnosticReport',
    patient_fhir_id: patient.fhir_id, response_code: 200
  })

  const report = {
    resourceType: 'DiagnosticReport',
    id: crypto.randomUUID(),
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/DiagnosticReport'],
      tag: [{ system: 'http://oxygenhaiti.com/fhir/tags', code: `care-summary-${days}d` }]
    },
    status: 'final',
    category: [{
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'CT', display: 'Cardiology' }]
    }],
    code: {
      coding: [{ system: 'http://loinc.org', code: '34117-2', display: 'History and physical note' }],
      text: `OxyGen Care — Rapò ${days} jou`
    },
    subject: { reference: `Patient/${patient.fhir_id}`, display: patient.given_name },
    effectivePeriod: {
      start: dateFrom.toISOString(),
      end: new Date().toISOString()
    },
    issued: new Date().toISOString(),
    performer: [{ display: 'OxyGen Care — Sistèm telesiveyan' }],

    // Résultats inline (contained)
    contained: [
      ...(avgSys && avgDia ? [{
        resourceType: 'Observation', id: 'avg-bp', status: 'final',
        code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }], text: `Tansyon mwayèn ${days}j` },
        component: [
          { code: { coding: [{ system: 'http://loinc.org', code: '8480-6' }] }, valueQuantity: { value: avgSys, unit: 'mmHg' } },
          { code: { coding: [{ system: 'http://loinc.org', code: '8462-4' }] }, valueQuantity: { value: avgDia, unit: 'mmHg' } }
        ],
        extension: [
          { url: 'http://oxygenhaiti.com/fhir/extension/bp-min-systolic', valueQuantity: { value: minSys, unit: 'mmHg' } },
          { url: 'http://oxygenhaiti.com/fhir/extension/bp-max-systolic', valueQuantity: { value: maxSys, unit: 'mmHg' } },
          { url: 'http://oxygenhaiti.com/fhir/extension/bp-pct-in-target', valueDecimal: pctTarget }
        ]
      }] : []),
      ...(avgGly ? [{
        resourceType: 'Observation', id: 'avg-gly', status: 'final',
        code: { coding: [{ system: 'http://loinc.org', code: '2339-0', display: 'Glucose' }], text: `Glisemi mwayèn ${days}j` },
        valueQuantity: { value: avgGly, unit: 'mg/dL' }
      }] : []),
      ...(hba1cEst ? [{
        resourceType: 'Observation', id: 'hba1c-est', status: 'final',
        code: { coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'HbA1c estimated (ADAG formula)' }] },
        valueQuantity: { value: hba1cEst, unit: '%' },
        note: [{ text: 'Valè estimé — konfime ak labo' }]
      }] : []),
      ...(hba1cLab ? [{
        resourceType: 'Observation', id: 'hba1c-lab', status: 'final',
        code: { coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'HbA1c laboratory' }] },
        valueQuantity: { value: hba1cLab, unit: '%' }
      }] : [])
    ],

    result: [
      ...(avgSys   ? [{ reference: '#avg-bp' }]     : []),
      ...(avgGly   ? [{ reference: '#avg-gly' }]    : []),
      ...(hba1cEst ? [{ reference: '#hba1c-est' }]  : []),
      ...(hba1cLab ? [{ reference: '#hba1c-lab' }]  : [])
    ],

    conclusion: [
      taObs.length > 0
        ? `Tansyon: mwayèn ${avgSys}/${avgDia} mmHg sou ${days} jou — ${pctTarget}% nan sib (<140/90).`
        : 'Tansyon: pa ase done.',
      glyObs.length > 0
        ? `Glisemi: mwayèn ${avgGly} mg/dL.${hba1cEst ? ` HbA1c estimé: ${hba1cEst}%.` : ''}`
        : '',
      `Total mezi: ${obs.length} sou ${days} jou.`,
      `Kondisyon: ${(patient.conditions || []).join(', ') || 'Non spécifié'}.`
    ].filter(Boolean).join(' '),

    conclusionCode: [{
      coding: [{ system: 'http://snomed.info/sct', code: '444783004', display: 'Remote monitoring of patient' }]
    }]
  }

  return Response.json({
    resourceType: 'Bundle',
    id: crypto.randomUUID(),
    type: 'searchset',
    timestamp: new Date().toISOString(),
    total: 1,
    entry: [{
      fullUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/fhir/DiagnosticReport/${report.id}`,
      resource: report
    }]
  }, { status: 200, headers: FHIR_HEADERS })
}