import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FHIR_BASE = (process.env.NEXT_PUBLIC_SITE_URL || '') + '/api/fhir'
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
    return fhirError(401, 'security', 'Missing Bearer token')
  }

  const { id } = await params

  const { data: patient, error } = await supabase
    .from('fhir_patient_view')
    .select('*')
    .or(`fhir_id.eq.${id},oxc_id.eq.${id}`)
    .single()

  if (error || !patient) {
    return fhirError(404, 'not-found', `Patient ${id} not found`)
  }

  // Audit log
  await supabase.from('fhir_audit_log').insert({
    action: 'read',
    resource_type: 'Patient',
    resource_id: patient.fhir_id,
    patient_fhir_id: patient.fhir_id,
    response_code: 200
  })

  const resource = {
    resourceType: 'Patient',
    id: patient.fhir_id,
    meta: {
      versionId: '1',
      lastUpdated: patient.registration_date,
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      tag: [{ system: 'http://oxygenhaiti.com/fhir/tags', code: 'care-patient' }]
    },
    identifier: [
      { use: 'official', system: 'http://oxygenhaiti.com/fhir/identifier/oxc-id', value: patient.oxc_id },
      { use: 'secondary', system: 'http://oxygenhaiti.com/fhir/identifier/fhir-id', value: patient.fhir_id }
    ],
    active: true,
    name: [{ use: 'official', given: [patient.given_name] }],
    telecom: [{ system: 'phone', value: patient.telecom_phone, use: 'mobile' }],
    gender: patient.gender === 'm' ? 'male' : patient.gender === 'f' ? 'female' : 'unknown',
    address: [{
      use: 'home',
      country: 'HT',
      district: patient.address_zone,
      text: `${patient.address_zone || ''}, Haiti`
    }],
    communication: [{
      language: {
        coding: [{
          system: 'urn:ietf:bcp:47',
          code: patient.language === 'ht' ? 'ht' : patient.language === 'fr' ? 'fr' : 'en',
          display: patient.language === 'ht' ? 'Haitian Creole' : patient.language === 'fr' ? 'French' : 'English'
        }]
      },
      preferred: true
    }],
    extension: [
      {
        url: 'http://oxygenhaiti.com/fhir/extension/age-range',
        valueString: patient.age_range || 'unknown'
      },
      {
        url: 'http://oxygenhaiti.com/fhir/extension/chronic-conditions',
        valueCodeableConcept: {
          coding: (patient.snomed_conditions || []).map((c: any) => ({
            system: 'http://snomed.info/sct',
            code: c.code,
            display: c.display
          })),
          text: (patient.conditions || []).join(', ')
        }
      },
      {
        url: 'http://oxygenhaiti.com/fhir/extension/data-consent',
        valueBoolean: patient.data_consent || false
      }
    ],
    link: [{
      other: { reference: `${FHIR_BASE}/Observation?patient=${patient.fhir_id}` },
      type: 'seealso'
    }]
  }

  return Response.json(resource, { status: 200, headers: FHIR_HEADERS })
}