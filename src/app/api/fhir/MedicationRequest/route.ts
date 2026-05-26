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
  if (!patientId) return fhirError(400, 'required', 'patient parameter required')

  const { data: medications, error } = await supabase
    .from('fhir_medication_view')
    .select('*')
    .or(`patient_fhir_id.eq.${patientId},patient_oxc_id.eq.${patientId}`)
    .eq('status', true)

  if (error) return fhirError(500, 'exception', error.message)

  const resources = (medications || []).map(med => ({
    resourceType: 'MedicationRequest',
    id: med.medication_request_id,
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/MedicationRequest'] },
    status: 'active',
    intent: 'order',
    subject: {
      reference: `Patient/${med.patient_fhir_id}`,
      identifier: { value: med.patient_oxc_id }
    },
    medicationCodeableConcept: {
      coding: [
        ...(med.rxnorm_code ? [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: med.rxnorm_code, display: med.medication_generic }] : []),
        ...(med.atc_code ? [{ system: 'http://www.whocc.no/atc', code: med.atc_code, display: med.medication_generic }] : [])
      ],
      text: med.medication_name
    },
    dosageInstruction: [{
      text: `${med.dosage || ''} — ${med.frequency || ''}/jou`,
      timing: {
        repeat: {
          frequency: med.frequency === '1x' ? 1 : med.frequency === '2x' ? 2 : 3,
          period: 1,
          periodUnit: 'd',
          timeOfDay: med.timing_times || []
        }
      },
      route: {
        coding: [{ system: 'http://snomed.info/sct', code: '26643006', display: 'Oral route' }]
      },
      additionalInstruction: med.with_food ? [{
        coding: [{ system: 'http://snomed.info/sct', code: '311504000', display: 'With or after food' }],
        text: 'Pran ak manje'
      }] : []
    }],
    authoredOn: med.authored_on,
    requester: med.requester ? { display: med.requester } : undefined,
    category: [{
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-category', code: 'outpatient' }]
    }]
  }))

  await supabase.from('fhir_audit_log').insert({
    action: 'search', resource_type: 'MedicationRequest',
    patient_fhir_id: patientId, response_code: 200
  })

  return Response.json({
    resourceType: 'Bundle',
    id: crypto.randomUUID(),
    type: 'searchset',
    timestamp: new Date().toISOString(),
    total: resources.length,
    entry: resources.map(r => ({
      fullUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/fhir/MedicationRequest/${r.id}`,
      resource: r,
      search: { mode: 'match' }
    }))
  }, { status: 200, headers: FHIR_HEADERS })
}