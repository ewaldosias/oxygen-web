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
  const code      = searchParams.get('code')
  const dateFrom  = searchParams.get('date')
  const count     = parseInt(searchParams.get('_count') || '50')

  if (!patientId) return fhirError(400, 'required', 'patient parameter required')

  let query = supabase
    .from('fhir_observation_view')
    .select('*')
    .or(`patient_fhir_id.eq.${patientId},patient_oxc_id.eq.${patientId}`)
    .order('effective_datetime', { ascending: false })
    .limit(count)

  if (dateFrom?.startsWith('ge')) {
    query = query.gte('effective_datetime', dateFrom.replace('ge', ''))
  }

  const { data: observations, error } = await query
  if (error) return fhirError(500, 'exception', error.message)

  const entries: any[] = []

  for (const obs of (observations || [])) {
    const base = {
      meta: { profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns'] },
      status: 'final',
      subject: { reference: `Patient/${obs.patient_fhir_id}`, identifier: { value: obs.patient_oxc_id } },
      effectiveDateTime: obs.effective_datetime,
      issued: obs.issued,
      method: {
        coding: [{
          system: 'http://oxygenhaiti.com/fhir/method',
          code: obs.input_source || 'manual',
          display: obs.input_source === 'device' ? 'Electronic device' : 'Patient reported'
        }]
      }
    }

    // TA Panel
    if (obs.ta_sys_value && obs.ta_dia_value) {
      if (!code || ['85354-9','8480-6','8462-4'].includes(code)) {
        entries.push({
          ...base,
          resourceType: 'Observation',
          id: `${obs.observation_id}-bp`,
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }], text: 'Tansyon' },
          component: [
            { code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] }, valueQuantity: { value: obs.ta_sys_value, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' } },
            { code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] }, valueQuantity: { value: obs.ta_dia_value, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' } }
          ]
        })
      }
    }

    // Glycémie
    if (obs.glycemie_value) {
      if (!code || [obs.glycemie_loinc, '2339-0'].includes(code)) {
        entries.push({
          ...base,
          resourceType: 'Observation',
          id: `${obs.observation_id}-gly`,
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: obs.glycemie_loinc, display: 'Glucose' }], text: 'Glisemi / Sik' },
          valueQuantity: { value: obs.glycemie_value, unit: 'mg/dL', system: 'http://unitsofmeasure.org', code: 'mg/dL' },
          referenceRange: [{ low: { value: 80, unit: 'mg/dL' }, high: { value: 130, unit: 'mg/dL' }, text: 'A jen: 80-130 mg/dL' }]
        })
      }
    }

    // Fréquence cardiaque
    if (obs.hr_value && (!code || code === '8867-4')) {
      entries.push({
        ...base,
        resourceType: 'Observation',
        id: `${obs.observation_id}-hr`,
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }], text: 'Batman kè' },
        valueQuantity: { value: obs.hr_value, unit: '/min', system: 'http://unitsofmeasure.org', code: '/min' }
      })
    }

    // Poids
    if (obs.weight_kg && (!code || code === '29463-7')) {
      entries.push({
        ...base,
        resourceType: 'Observation',
        id: `${obs.observation_id}-wt`,
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '29463-7', display: 'Body weight' }], text: 'Pwa' },
        valueQuantity: { value: obs.weight_kg, unit: 'kg', system: 'http://unitsofmeasure.org', code: 'kg' }
      })
    }

    // HbA1c
    if (obs.hba1c_value && (!code || code === '4548-4')) {
      entries.push({
        ...base,
        resourceType: 'Observation',
        id: `${obs.observation_id}-hba1c`,
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'Hemoglobin A1c' }], text: 'HbA1c' },
        valueQuantity: { value: obs.hba1c_value, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
        referenceRange: [{ high: { value: 7, unit: '%' }, text: 'Cible: < 7%' }]
      })
    }
  }

  // Audit
  await supabase.from('fhir_audit_log').insert({
    action: 'search', resource_type: 'Observation',
    patient_fhir_id: patientId, response_code: 200
  })

  return Response.json({
    resourceType: 'Bundle',
    id: crypto.randomUUID(),
    type: 'searchset',
    timestamp: new Date().toISOString(),
    total: entries.length,
    link: [{ relation: 'self', url: request.url }],
    entry: entries.map(r => ({
      fullUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/fhir/${r.resourceType}/${r.id}`,
      resource: r,
      search: { mode: 'match' }
    }))
  }, { status: 200, headers: FHIR_HEADERS })
}