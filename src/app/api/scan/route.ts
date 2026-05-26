import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const PROMPTS: Record<string, string> = {
  vital_signs: `
Tu es un assistant médical. Analyse cette image d'un appareil médical ou d'une feuille de mesures.
Extrait UNIQUEMENT les valeurs visibles et retourne un JSON strict sans markdown.
Format exact (null si non visible):
{
  "ta_sys": null,
  "ta_dia": null,
  "fc": null,
  "fr": null,
  "temperature": null,
  "spo2": null,
  "poids": null,
  "glycemie": null,
  "glycemie_type": null,
  "confidence": 0.0
}
glycemie_type: "fasting", "post_meal", ou "random" si indiqué, sinon null.
confidence: 0.0 à 1.0 selon la clarté de l'image.
Retourne UNIQUEMENT le JSON, aucun texte avant ou après.`,

  lab_result: `
Tu es un assistant médical. Analyse cette feuille de résultats d'examens de laboratoire.
Extrait toutes les valeurs numériques visibles et retourne un JSON strict sans markdown.
Format exact (null si non visible):
{
  "hba1c": null,
  "glucose_jejun": null,
  "glucose_2h": null,
  "creatinine": null,
  "uree": null,
  "acide_urique": null,
  "dfg": null,
  "cholesterol_total": null,
  "hdl": null,
  "ldl": null,
  "triglycerides": null,
  "asat": null,
  "alat": null,
  "bilirubine_tot": null,
  "hemoglobine": null,
  "hematocrite": null,
  "globules_blancs": null,
  "plaquettes": null,
  "tsh": null,
  "t4_libre": null,
  "result_date": null,
  "lab_name": null,
  "confidence": 0.0
}
result_date: format "YYYY-MM-DD" si visible.
confidence: 0.0 à 1.0 selon la clarté de l'image.
Retourne UNIQUEMENT le JSON, aucun texte avant ou après.`
}

export async function POST(request: NextRequest) {
  try {
    const { image, scan_type, media_type } = await request.json()

    if (!image || !scan_type) {
      return Response.json({ error: 'image and scan_type required' }, { status: 400 })
    }

    const prompt = PROMPTS[scan_type]
    if (!prompt) {
      return Response.json({ error: 'Invalid scan_type' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: media_type || 'image/jpeg',
              data: image
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    })

    const rawText = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('')

    // Parse JSON — remove any markdown fences if present
    const clean = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    // Remove null values for cleaner response
    const fields: Record<string, any> = {}
    for (const [key, val] of Object.entries(parsed)) {
      if (val !== null && val !== undefined && key !== 'confidence') {
        fields[key] = val
      }
    }

    return Response.json({
      success: true,
      fields,
      confidence: parsed.confidence || 0,
      raw: rawText,
      fields_count: Object.keys(fields).length
    })

  } catch (error: any) {
    console.error('Scan API error:', error)
    return Response.json({
      error: error.message || 'Scan failed',
      success: false
    }, { status: 500 })
  }
}