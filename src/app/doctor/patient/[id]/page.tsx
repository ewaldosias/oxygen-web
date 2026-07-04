'use client'

import Grain from '@/components/Grain'
import { isPreview } from '@/lib/preview'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  Square, Mic, Camera, ChartColumn, Stethoscope, Smartphone,
  HeartPulse, ClipboardList, Baby, Eye, FlaskConical, Pill,
  Calendar, CircleCheck, Microscope,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEAL = '#0A7A6A'
const NAVY = '#1B2A4A'
const GOLD = '#D4A843'

type ScanType = 'vital_signs' | 'lab_result' | 'consultation' | 'prescription'
type ConsultStep = 'idle' | 'form' | 'saving' | 'saved'

interface ScanResult {
  fields: Record<string, any>
  confidence: number
  fields_count: number
}

interface PatientData {
  id: string; name: string; phone: string
  conditions: string[]; specialty: string; oxcId: string; status: string
}
interface LatestVitals {
  ta_sys: number|null; ta_dia: number|null; glycemie: number|null
  fc: number|null; temperature: number|null; spo2: number|null
  poids: number|null; recorded_at: string
}

const FIELD_LABELS: Record<string,string> = {
  ta_sys:'Tansyon Sistòl', ta_dia:'Tansyon Dyastòl', fc:'Batman kè',
  fr:'Souf (FR)', temperature:'Tanperati', spo2:'SpO2', poids:'Pwa',
  histoire_maladie:'Istwa maladi', antecedents_medicaux:'Antesadan medikal',
  antecedents_chirurgicaux:'Antesadan chirujikal', antecedents_familiaux:'Antesadan familyal',
  allergies:'Alèji', diagnostic:'Dyagnostik', prescription:'Òdonans', notes:'Nòt',
  age_gestationnel_sem:'Semèn gwosès', hauteur_uterine:'Wotè iteris',
  bdcf:'BDCF', proteinuria_bandelette:'Pwoteyin pipi',
  acuite_od_sc:'Akite OD (san)', acuite_og_sc:'Akite OG (san)',
  pression_oculaire_od:'Presyon OD', pression_oculaire_og:'Presyon OG',
}

function getTaColor(sys: number, dia: number) {
  if (sys>=180||dia>=120) return '#7B0D1E'
  if (sys>=160||dia>=110) return '#C0392B'
  if (sys>=140||dia>=100) return '#E07B2A'
  if (sys>=130||dia>=90)  return '#E0A82A'
  return '#1A8A4A'
}

/* ── SPEECH RECOGNITION ── */
function useSpeech() {
  const [listening, setListening] = useState(false)
  const recRef = useRef<any>(null)

  function start(onResult: (text: string) => void) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Transcription pa disponib sou navigatè sa — eseye Chrome'); return }
    const rec = new SR()
    rec.lang = 'fr-FR'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult  = (e: any) => { onResult(e.results[0][0].transcript); setListening(false) }
    rec.onend     = () => setListening(false)
    rec.onerror   = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  function stop() { recRef.current?.stop(); setListening(false) }
  return { listening, start, stop }
}

function MicBtn({ value, set, speech }: { value:string; set:(v:string)=>void; speech:ReturnType<typeof useSpeech> }) {
  function toggle() {
    if (speech.listening) { speech.stop(); return }
    speech.start(text => set(value + (value ? ' ' : '') + text))
  }
  return (
    <button onClick={toggle} style={{
      padding:'5px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:700,
      cursor:'pointer', fontFamily:'var(--font-manrope), Manrope, sans-serif', flexShrink:0,
      background: speech.listening ? 'rgba(192,57,43,.1)' : 'rgba(10,122,106,.08)',
      border: `1px solid ${speech.listening ? 'rgba(192,57,43,.3)' : 'rgba(10,122,106,.2)'}`,
      color: speech.listening ? '#C0392B' : TEAL,
      animation: speech.listening ? 'pulse 1s ease-in-out infinite' : 'none',
    }}>
      {speech.listening ? (
        <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Square size={13} strokeWidth={1.9}/>Stop</span>
      ) : (
        <Mic size={13} strokeWidth={1.9}/>
      )}
    </button>
  )
}

export default function DoctorPatientPage() {
  const router = useRouter()
  const params = useParams()
  const patientRelId = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [patient,      setPatient]      = useState<PatientData|null>(null)
  const [vitals,       setVitals]       = useState<LatestVitals|null>(null)
  const [history,      setHistory]      = useState<any[]>([])
  const [consultStep,  setConsultStep]  = useState<ConsultStep>('idle')
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState<'overview'|'consult'>('overview')

  // Scan
  const [scanType,    setScanType]    = useState<ScanType>('consultation')
  const [scanModal,   setScanModal]   = useState(false)
  const [scanImage,   setScanImage]   = useState('')
  const [scanResult,  setScanResult]  = useState<ScanResult|null>(null)
  const [scanPending, setScanPending] = useState(false)

  // ── Signes vitaux consultation
  const [cTaSys,  setCTaSys]  = useState('')
  const [cTaDia,  setCTaDia]  = useState('')
  const [cFc,     setCFc]     = useState('')
  const [cFr,     setCFr]     = useState('')
  const [cTemp,   setCTemp]   = useState('')
  const [cSpo2,   setCSpo2]   = useState('')
  const [cPoids,  setCPoids]  = useState('')

  // ── Anamnèse
  const [histoire,    setHistoire]    = useState('')
  const [antecMed,    setAntecMed]    = useState('')
  const [antecChir,   setAntecChir]   = useState('')
  const [antecFam,    setAntecFam]    = useState('')
  const [allergies,   setAllergies]   = useState('')

  // ── Consultation
  const [notes,        setNotes]        = useState('')
  const [diagnostic,   setDiagnostic]   = useState('')
  const [prescription, setPrescription] = useState('')
  const [nextAppt,     setNextAppt]     = useState('')

  // ── Obstétrique
  const [ageGest,     setAgeGest]     = useState('')
  const [hauteurUt,   setHauteurUt]   = useState('')
  const [bdcf,        setBdcf]        = useState('')
  const [proteinuria, setProteinuria] = useState('')

  // ── Ophtalmologie
  const [acuiteOdSc, setAcuiteOdSc] = useState('')
  const [acuiteOgSc, setAcuiteOgSc] = useState('')
  const [acuiteOdAc, setAcuiteOdAc] = useState('')
  const [acuiteOgAc, setAcuiteOgAc] = useState('')
  const [presOd,     setPresOd]      = useState('')
  const [presOg,     setPresOg]      = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      if (isPreview()) { setLoading(false); return }
      const { data: dp } = await supabase
        .from('doctor_patients').select('*')
        .eq('id', patientRelId).single()
      if (!dp) { router.push('/doctor/home'); return }

      setPatient({
        id: dp.id, name: dp.patient_name||'Pasyan', phone: dp.patient_phone||'',
        conditions: dp.conditions||[], specialty: dp.specialty||'medecine_interne',
        oxcId: dp.patient_oxc_id||'—', status: dp.status||'invited',
      })

      if (dp.patient_id) {
        const { data: readings } = await supabase
          .from('vital_signs_readings')
          .select('ta_sys,ta_dia,glycemie,fc,temperature,spo2,poids,recorded_at')
          .eq('user_id', dp.patient_id)
          .order('recorded_at', { ascending: false }).limit(1)
        if (readings?.length) setVitals(readings[0])

        const { data: hist } = await supabase
          .from('vital_signs_readings')
          .select('ta_sys,ta_dia,glycemie,recorded_at')
          .eq('user_id', dp.patient_id)
          .order('recorded_at', { ascending: false }).limit(7)
        if (hist) setHistory(hist)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  /* ── SCAN ── */
  function openScan(type: ScanType) {
    setScanType(type); setScanResult(null); setScanImage('')
    fileRef.current?.click()
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setScanPending(true); setScanModal(true)
    const base64 = await new Promise<string>((res,rej) => {
      const r = new FileReader()
      r.onload = () => res((r.result as string).split(',')[1])
      r.onerror = rej; r.readAsDataURL(file)
    })
    setScanImage(`data:${file.type};base64,${base64}`)
    try {
      const resp = await fetch('/api/scan', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ image:base64, scan_type:scanType, media_type:file.type })
      })
      const data = await resp.json()
      if (data.success) setScanResult(data)
      else { alert('Skane pa reyisi'); setScanModal(false) }
    } catch { alert('Erè koneksyon'); setScanModal(false) }
    finally { setScanPending(false); e.target.value = '' }
  }

  function applyScan() {
    if (!scanResult) return
    const f = scanResult.fields
    // Signes vitaux
    if (f.ta_sys)      setCTaSys(String(f.ta_sys))
    if (f.ta_dia)      setCTaDia(String(f.ta_dia))
    if (f.fc)          setCFc(String(f.fc))
    if (f.fr)          setCFr(String(f.fr))
    if (f.temperature) setCTemp(String(f.temperature))
    if (f.spo2)        setCSpo2(String(f.spo2))
    if (f.poids)       setCPoids(String(f.poids))
    // Anamnèse
    if (f.histoire_maladie)        setHistoire(f.histoire_maladie)
    if (f.antecedents_medicaux)    setAntecMed(f.antecedents_medicaux)
    if (f.antecedents_chirurgicaux) setAntecChir(f.antecedents_chirurgicaux)
    if (f.antecedents_familiaux)   setAntecFam(f.antecedents_familiaux)
    if (f.allergies)               setAllergies(f.allergies)
    // Consultation
    if (f.diagnostic)   setDiagnostic(f.diagnostic)
    if (f.notes)        setNotes(f.notes)
    // Ordonnance
    if (f.prescription) setPrescription(f.prescription)
    if (f.medicaments)  setPrescription(
      f.medicaments.map((m:any)=>`${m.nom||''} ${m.dosage||''} — ${m.frequence||''} — ${m.duree||''}`).join('\n')
    )
    // Obstétrique
    if (f.age_gestationnel_sem)   setAgeGest(String(f.age_gestationnel_sem))
    if (f.hauteur_uterine)        setHauteurUt(String(f.hauteur_uterine))
    if (f.bdcf)                   setBdcf(String(f.bdcf))
    if (f.proteinuria_bandelette) setProteinuria(f.proteinuria_bandelette)
    // Ophtalmo
    if (f.acuite_od_sc)          setAcuiteOdSc(String(f.acuite_od_sc))
    if (f.acuite_og_sc)          setAcuiteOgSc(String(f.acuite_og_sc))
    if (f.pression_oculaire_od)  setPresOd(String(f.pression_oculaire_od))
    if (f.pression_oculaire_og)  setPresOg(String(f.pression_oculaire_og))
    setScanModal(false)
  }

  /* ── SAVE CONSULTATION ── */
  async function handleSave() {
    setConsultStep('saving')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: dp } = await supabase
        .from('doctor_patients').select('patient_id,specialty')
        .eq('id', patientRelId).single()

      const entry: any = {
        patient_id:      dp?.patient_id || null,
        doctor_id:       user.id,
        specialty:       dp?.specialty || 'medecine_interne',
        consultation_at: new Date().toISOString(),
        examen_clinique: notes,
        diagnostic,
        prescription,
        next_appointment: nextAppt || null,
        // Custom: anamnèse stored in notes
        notes: [
          histoire    ? `Istwa maladi: ${histoire}` : '',
          antecMed    ? `Antesadan medikal: ${antecMed}` : '',
          antecChir   ? `Antesadan chirujikal: ${antecChir}` : '',
          antecFam    ? `Antesadan familyal: ${antecFam}` : '',
          allergies   ? `Alèji: ${allergies}` : '',
        ].filter(Boolean).join('\n'),
      }

      // Signes vitaux consultation (sauvegardés séparément dans vital_signs_readings)
      if (dp?.patient_id && (cTaSys || cFc || cTemp || cSpo2 || cPoids)) {
        const vitEntry: any = {
          user_id: dp.patient_id, recorded_at: new Date().toISOString(),
          entry_mode: 'manual', entry_type: 'doctor', entered_by: user.id,
        }
        if (cTaSys && cTaDia) { vitEntry.ta_sys = parseInt(cTaSys); vitEntry.ta_dia = parseInt(cTaDia) }
        if (cFc)    vitEntry.fc          = parseInt(cFc)
        if (cFr)    vitEntry.fr          = parseInt(cFr)
        if (cTemp)  vitEntry.temperature = parseFloat(cTemp)
        if (cSpo2)  vitEntry.spo2        = parseInt(cSpo2)
        if (cPoids && parseFloat(cPoids) > 0) vitEntry.poids = parseFloat(cPoids)
        await supabase.from('vital_signs_readings').insert(vitEntry)
      }

      // Obstétrique
      if (patient?.specialty === 'obstetrique_gyneco') {
        if (ageGest)     entry.age_gestationnel_sem  = parseInt(ageGest)
        if (hauteurUt)   entry.hauteur_uterine        = parseInt(hauteurUt)
        if (bdcf)        entry.bdcf                   = parseInt(bdcf)
        if (proteinuria) entry.proteinuria_bandelette = proteinuria
      }

      // Ophtalmologie
      if (patient?.specialty === 'ophtalmologie') {
        if (acuiteOdSc) entry.acuite_od_sc = acuiteOdSc
        if (acuiteOgSc) entry.acuite_og_sc = acuiteOgSc
        if (acuiteOdAc) entry.acuite_od_ac = acuiteOdAc
        if (acuiteOgAc) entry.acuite_og_ac = acuiteOgAc
        if (presOd)     entry.pression_oculaire_od = parseInt(presOd)
        if (presOg)     entry.pression_oculaire_og = parseInt(presOg)
      }

      await supabase.from('consultation_entries').insert(entry)
      setConsultStep('saved')
      setTimeout(() => setConsultStep('idle'), 2500)
    } catch (err) { console.error(err); setConsultStep('idle') }
  }

  const speech = useSpeech()
  const isObstetrique = patient?.specialty === 'obstetrique_gyneco'
  const isOphtalmo    = patient?.specialty === 'ophtalmologie'

  const inputStyle: React.CSSProperties = {
    width:'100%', border:'1.5px solid rgba(27,42,74,.15)', borderRadius:'12px',
    padding:'10px 14px', fontSize:'14px', color:NAVY, fontFamily:'var(--font-manrope), Manrope, sans-serif',
    outline:'none', transition:'border-color .2s',
  }
  const numStyle: React.CSSProperties = {
    ...inputStyle, fontFamily:'DM Mono, monospace', fontSize:'15px',
    fontWeight:600, textAlign:'center', width:'70px', padding:'8px',
  }

  function NumRow({ label, value, set, unit }: { label:string; value:string; set:(v:string)=>void; unit:string }) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'7px 0',borderBottom:'1px solid rgba(27,42,74,.06)'}}>
        <div style={{flex:1,fontSize:'13px',fontWeight:600,color:NAVY}}>{label}</div>
        <input value={value} onChange={e=>set(e.target.value)} type="number" style={numStyle}/>
        <div style={{fontSize:'11px',color:'#6B7A90',fontWeight:600,width:'38px'}}>{unit}</div>
      </div>
    )
  }

  function ScanBtn({ type, label }: { type:ScanType; label:string }) {
    return (
      <button onClick={()=>openScan(type)} style={{display:'flex',alignItems:'center',gap:'5px',background:'rgba(10,122,106,.08)',border:'1px solid rgba(10,122,106,.2)',borderRadius:'10px',padding:'6px 12px',fontSize:'11px',fontWeight:700,color:TEAL,cursor:'pointer',fontFamily:'var(--font-manrope), Manrope, sans-serif',flexShrink:0}}>
        <Camera size={13} strokeWidth={1.9}/> {label}
      </button>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'radial-gradient(115% 78% at 50% -8%,#D6EBCE 0%,#E6F1DC 50%,#DBEBD1 100%)',fontFamily:'var(--font-manrope), Manrope, sans-serif',paddingBottom:'120px'}}>
      <Grain/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        input:focus,textarea:focus{outline:2px solid ${TEAL}!important;outline-offset:1px;border-color:${TEAL}!important}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes modalIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .fu{animation:fadeUp .4s ease forwards}
        .modal{animation:modalIn .3s ease forwards}
        .spin{animation:spin 1s linear infinite;display:inline-block}
        .tb{transition:all .15s;cursor:pointer}.tb:active{opacity:.8}
        @media(prefers-reduced-motion:reduce){.fu,.modal,.spin{animation:none}}
      `}</style>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        onChange={handleFileSelect} style={{display:'none'}}/>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(150deg,${NAVY} 0%,#2D4A6B 100%)`,padding:'52px 20px 18px',borderRadius:'0 0 24px 24px',marginBottom:'14px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
          <button onClick={()=>router.push('/doctor/home')} style={{width:'32px',height:'32px',borderRadius:'10px',background:'rgba(255,255,255,.15)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none"><path d="M7 1L1 6.5L7 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,.6)',marginBottom:'4px'}}>
              Oxy<span style={{color:GOLD}}>Gen</span> Care · Doktè
            </div>
            {loading ? (
              <div style={{height:'24px',width:'160px',background:'rgba(255,255,255,.1)',borderRadius:'6px'}}/>
            ) : (
              <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'28px',fontWeight:800,letterSpacing:'-0.5px',color:'white'}}>{patient?.name}</div>
            )}
            <div style={{fontSize:'12.5px',color:'rgba(255,255,255,.55)',marginTop:'3px'}}>
              {patient?.conditions?.join(' · ')} · {patient?.oxcId}
            </div>
          </div>
          <ScanBtn type="consultation" label="Skane fèy"/>
        </div>

        {/* Tab toggle */}
        <div style={{display:'flex',gap:'6px'}}>
          {([['overview',ChartColumn,'Apèsi'],['consult',Stethoscope,'Konsiltasyon']] as const).map(([key,Icon,label])=>(
            <button key={key} className="tb" onClick={()=>setActiveTab(key)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',flex:1,padding:'9px',borderRadius:'12px',fontSize:'12px',fontWeight:700,fontFamily:'var(--font-manrope), Manrope, sans-serif',border:`1px solid ${activeTab===key?GOLD:'rgba(255,255,255,.15)'}`,background:activeTab===key?'rgba(212,168,67,.2)':'rgba(255,255,255,.08)',color:activeTab===key?GOLD:'rgba(255,255,255,.55)',transition:'all .2s'}}>
              <Icon size={14} strokeWidth={1.9}/> {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:'0 16px'}}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Dernières mesures patient */}
            {vitals ? (
              <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'12px'}}>Dènye Mezi Pasyan</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                  {vitals.ta_sys && vitals.ta_dia && (
                    <div style={{background:'#F0F4F9',borderRadius:'12px',padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:'8px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',marginBottom:'4px'}}>TANSYON</div>
                      <div style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:getTaColor(vitals.ta_sys,vitals.ta_dia)}}>{vitals.ta_sys}/{vitals.ta_dia}</div>
                      <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>mmHg</div>
                    </div>
                  )}
                  {vitals.glycemie && (
                    <div style={{background:'#F0F4F9',borderRadius:'12px',padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:'8px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',marginBottom:'4px'}}>SIK</div>
                      <div style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:vitals.glycemie>180?'#C0392B':'#1A8A4A'}}>{vitals.glycemie}</div>
                      <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>mg/dL</div>
                    </div>
                  )}
                  {vitals.spo2 && (
                    <div style={{background:'#F0F4F9',borderRadius:'12px',padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:'8px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',marginBottom:'4px'}}>SPO2</div>
                      <div style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:vitals.spo2<95?'#C0392B':'#1A8A4A'}}>{vitals.spo2}%</div>
                    </div>
                  )}
                </div>
                <div style={{fontSize:'10px',color:'rgba(27,42,74,.4)',marginTop:'8px',textAlign:'right'}}>
                  {new Date(vitals.recorded_at).toLocaleDateString('fr-HT')}
                </div>
              </div>
            ) : (
              <div style={{background:'rgba(224,168,42,.06)',border:'1px solid rgba(224,168,42,.2)',borderRadius:'16px',padding:'16px',marginBottom:'12px',textAlign:'center'}}>
                <div style={{marginBottom:'6px',display:'flex',justifyContent:'center'}}><Smartphone size={20} strokeWidth={1.9} color="#8C6B00"/></div>
                <div style={{fontSize:'13px',fontWeight:700,color:'#8C6B00'}}>Pako gen mezi — pasyan poko aktif</div>
              </div>
            )}

            {/* Historique */}
            {history.length > 0 && (
              <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'10px'}}>Istorik (7 dènye mesure)</div>
                {history.map((r,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:i<history.length-1?'1px solid rgba(27,42,74,.05)':'none'}}>
                    <div style={{fontSize:'12px',color:'#6B7A90'}}>{new Date(r.recorded_at).toLocaleDateString('fr-HT')}</div>
                    {r.ta_sys && r.ta_dia && (
                      <div style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:getTaColor(r.ta_sys,r.ta_dia)}}>{r.ta_sys}/{r.ta_dia}</div>
                    )}
                    {r.glycemie && (
                      <div style={{fontFamily:'DM Mono, monospace',fontSize:'12px',color:'#6B7A90'}}>{r.glycemie} mg/dL</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button onClick={()=>setActiveTab('consult')} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',background:TEAL,color:'white',border:'none',borderRadius:'16px',padding:'17px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-manrope), Manrope, sans-serif',boxShadow:'0 6px 20px rgba(10,122,106,.3)'}}>
              <Stethoscope size={18} strokeWidth={1.9}/> Kòmanse Konsiltasyon
            </button>
          </>
        )}

        {/* ── CONSULTATION TAB ── */}
        {activeTab === 'consult' && (
          <>
            {/* ── SCAN BUTTONS ── */}
            <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'14px 16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}><Camera size={13} strokeWidth={1.9}/> Skane dokiman</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <ScanBtn type="consultation" label="Fèy konsiltasyon"/>
                <ScanBtn type="prescription" label="Òdonans"/>
                <ScanBtn type="vital_signs"  label="Chif sou on aparèy"/>
                <ScanBtn type="lab_result"   label="Rezilta labo"/>
              </div>
            </div>

            {/* ── SIGNES VITAUX ── */}
            <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase'}}><HeartPulse size={14} strokeWidth={1.9}/> Siy Vital (Konsiltasyon)</div>
                <ScanBtn type="vital_signs" label="Skane"/>
              </div>

              {/* TA */}
              <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'7px 0',borderBottom:'1px solid rgba(27,42,74,.06)'}}>
                <div style={{flex:1,fontSize:'13px',fontWeight:600,color:NAVY}}>Tansyon</div>
                <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                  <input value={cTaSys} onChange={e=>setCTaSys(e.target.value)} type="number" placeholder="120" style={numStyle}/>
                  <span style={{color:'rgba(27,42,74,.3)'}}>/</span>
                  <input value={cTaDia} onChange={e=>setCTaDia(e.target.value)} type="number" placeholder="80" style={numStyle}/>
                </div>
                <div style={{fontSize:'11px',color:'#6B7A90',fontWeight:600}}>mmHg</div>
              </div>

              <NumRow label="Batman kè"  value={cFc}    set={setCFc}    unit="bpm"/>
              <NumRow label="Souf (FR)"  value={cFr}    set={setCFr}    unit="/min"/>
              <NumRow label="Tanperati"  value={cTemp}  set={setCTemp}  unit="°C"/>
              <NumRow label="SpO2"       value={cSpo2}  set={setCSpo2}  unit="%"/>
              <NumRow label="Pwa"        value={cPoids} set={v=>{if(parseFloat(v)>=0||v==='')setCPoids(v)}} unit="kg"/>
            </div>

            {/* ── ANAMNÈSE ── */}
            <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'14px'}}><ClipboardList size={14} strokeWidth={1.9}/> Anamnèz</div>

              {[
                { label:'Istwa maladi (Motif konsiltasyon)', value:histoire,  set:setHistoire,  placeholder:'Pasyan vini pou... depi... li santi...' },
                { label:'Antesadan Medikal',                 value:antecMed,  set:setAntecMed,  placeholder:'HTA, Dyabèt, twò fwa...' },
                { label:'Antesadan Chirujikal',              value:antecChir, set:setAntecChir, placeholder:'Operasyon yo...' },
                { label:'Antesadan Familyal',                value:antecFam,  set:setAntecFam,  placeholder:'Maladi nan fanmi...' },
                { label:'Alèji',                             value:allergies, set:setAllergies, placeholder:'Medikaman, manje...' },
              ].map(f=>(
                <div key={f.label} style={{marginBottom:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'5px'}}>
                    <div style={{fontSize:'11px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'.5px'}}>{f.label}</div>
                    <MicBtn value={f.value} set={f.set} speech={speech}/>
                  </div>
                  <textarea value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder} rows={2}
                    style={{...inputStyle,resize:'none',lineHeight:1.5}}/>
                </div>
              ))}
            </div>

            {/* ── OBSTÉTRIQUE ── */}
            {isObstetrique && (
              <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:TEAL,textTransform:'uppercase',marginBottom:'10px'}}><Baby size={14} strokeWidth={1.9}/> Obstetrik</div>
                <NumRow label="Semèn gwosès" value={ageGest}   set={setAgeGest}   unit="sem"/>
                <NumRow label="Wotè iteris"  value={hauteurUt} set={setHauteurUt} unit="cm"/>
                <NumRow label="BDCF"         value={bdcf}      set={setBdcf}      unit="bpm"/>
                <div style={{padding:'8px 0',borderBottom:'1px solid rgba(27,42,74,.06)'}}>
                  <div style={{fontSize:'13px',fontWeight:600,color:NAVY,marginBottom:'6px'}}>Pwoteyin pipi</div>
                  <div style={{display:'flex',gap:'6px'}}>
                    {['negatif','+','++','+++'].map(v=>(
                      <button key={v} onClick={()=>setProteinuria(v)} style={{flex:1,padding:'7px',borderRadius:'8px',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-manrope), Manrope, sans-serif',border:`1px solid ${proteinuria===v?TEAL:'rgba(27,42,74,.15)'}`,background:proteinuria===v?TEAL:'white',color:proteinuria===v?'white':'#6B7A90',transition:'all .15s'}}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── OPHTALMOLOGIE ── */}
            {isOphtalmo && (
              <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:TEAL,textTransform:'uppercase',marginBottom:'10px'}}><Eye size={14} strokeWidth={1.9}/> Oftalmo</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'8px'}}>
                  {[
                    { label:'OD san kòreksyon', value:acuiteOdSc, set:setAcuiteOdSc },
                    { label:'OG san kòreksyon', value:acuiteOgSc, set:setAcuiteOgSc },
                    { label:'OD ak kòreksyon',  value:acuiteOdAc, set:setAcuiteOdAc },
                    { label:'OG ak kòreksyon',  value:acuiteOgAc, set:setAcuiteOgAc },
                  ].map(f=>(
                    <div key={f.label}>
                      <div style={{fontSize:'10px',fontWeight:700,color:'#6B7A90',marginBottom:'4px'}}>{f.label}</div>
                      <input value={f.value} onChange={e=>f.set(e.target.value)} placeholder="5/10" style={{...inputStyle,padding:'8px 10px',fontSize:'13px'}}/>
                    </div>
                  ))}
                </div>
                <NumRow label="Presyon OD" value={presOd} set={setPresOd} unit="mmHg"/>
                <NumRow label="Presyon OG" value={presOg} set={setPresOg} unit="mmHg"/>
              </div>
            )}

            {/* ── EXAMEN + DIAGNOSTIC ── */}
            <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'14px'}}><FlaskConical size={14} strokeWidth={1.9}/> Egzamen ak Dyagnostik</div>
              {[
                { label:'Egzamen klinik', value:notes,      set:setNotes,      placeholder:'Obsèvasyon pandan konsiltasyon an...',rows:3 },
                { label:'Dyagnostik',     value:diagnostic, set:setDiagnostic, placeholder:'Dyagnostik posé...',rows:2 },
              ].map(f=>(
                <div key={f.label} style={{marginBottom:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'5px'}}>
                    <div style={{fontSize:'11px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'.5px'}}>{f.label}</div>
                    <MicBtn value={f.value} set={f.set} speech={speech}/>
                  </div>
                  <textarea value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder} rows={f.rows}
                    style={{...inputStyle,resize:'none',lineHeight:1.5}}/>
                </div>
              ))}
            </div>

            {/* ── ORDONNANCE ── */}
            <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase'}}><Pill size={14} strokeWidth={1.9}/> Òdonans</div>
                <ScanBtn type="prescription" label="Skane òdonans"/>
              </div>
              <textarea value={prescription} onChange={e=>setPrescription(e.target.value)}
                placeholder={'Amlodipine 5mg — 1x/jou — 30 jou\nMetformine 500mg — 2x/jou ak manje — 30 jou\n...'}
                rows={5} style={{...inputStyle,resize:'none',lineHeight:1.6,fontFamily:'DM Mono, monospace',fontSize:'13px'}}/>
            </div>

            {/* ── PROCHAIN RDV ── */}
            <div className="fu" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'16px',marginBottom:'20px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'8px'}}><Calendar size={14} strokeWidth={1.9}/> Pwochen RDV</div>
              <input type="date" value={nextAppt} onChange={e=>setNextAppt(e.target.value)} style={inputStyle}/>
            </div>

            {/* ── SAVE ── */}
            {consultStep === 'idle' && (
              <button onClick={handleSave} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',background:TEAL,color:'white',border:'none',borderRadius:'16px',padding:'17px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-manrope), Manrope, sans-serif',boxShadow:'0 6px 20px rgba(10,122,106,.3)'}}>
                <CircleCheck size={18} strokeWidth={1.9}/> Sovgade Konsiltasyon
              </button>
            )}
            {consultStep === 'saving' && (
              <div style={{textAlign:'center',padding:'20px',background:'white',borderRadius:'16px',border:'1px solid rgba(27,42,74,.07)'}}>
                <div style={{fontSize:'14px',fontWeight:600,color:NAVY}}>N ap sovgade...</div>
              </div>
            )}
            {consultStep === 'saved' && (
              <div style={{textAlign:'center',padding:'20px',background:'rgba(26,138,74,.06)',borderRadius:'16px',border:'1px solid rgba(26,138,74,.2)'}}>
                <div style={{marginBottom:'6px',display:'flex',justifyContent:'center'}}><CircleCheck size={28} strokeWidth={1.9} color={TEAL}/></div>
                <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'18px',fontWeight:700,color:'#1A8A4A'}}>Konsiltasyon sovgade !</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── SCAN MODAL ── */}
      {scanModal && (
        <>
          <div onClick={()=>!scanPending&&setScanModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:200,backdropFilter:'blur(4px)'}}/>
          <div className="modal" style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',zIndex:201,background:'white',borderRadius:'24px 24px 0 0',padding:'24px 24px 48px',maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{width:'36px',height:'4px',background:'rgba(0,0,0,.1)',borderRadius:'2px',margin:'0 auto 20px'}}/>

            {scanPending ? (
              <div style={{textAlign:'center',padding:'32px 0'}}>
                <div className="spin" style={{marginBottom:'16px'}}><Microscope size={40} strokeWidth={1.9} color={NAVY}/></div>
                <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'22px',fontWeight:700,color:NAVY,marginBottom:'8px'}}>Claude ap analize imaj la...</div>
                <div style={{fontSize:'13px',color:'#6B7A90'}}>Tanpri tann yon moman</div>
              </div>
            ) : scanResult ? (
              <>
                {scanImage && (
                  <div style={{marginBottom:'14px',borderRadius:'12px',overflow:'hidden',maxHeight:'180px',display:'flex',alignItems:'center',justifyContent:'center',background:'#F0F4F9'}}>
                    <img src={scanImage} alt="scan" style={{maxWidth:'100%',maxHeight:'180px',objectFit:'contain'}}/>
                  </div>
                )}
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
                  <div style={{flex:1,height:'5px',borderRadius:'3px',background:'rgba(27,42,74,.1)',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${scanResult.confidence*100}%`,background:scanResult.confidence>0.8?'#1A8A4A':scanResult.confidence>0.5?GOLD:'#C0392B',borderRadius:'3px'}}/>
                  </div>
                  <div style={{fontSize:'11px',fontWeight:700,color:scanResult.confidence>0.8?'#1A8A4A':GOLD}}>
                    {Math.round(scanResult.confidence*100)}% konfyans
                  </div>
                </div>
                <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'18px',fontWeight:700,color:NAVY,marginBottom:'10px'}}>
                  {scanResult.fields_count} valè jwenn
                </div>
                <div style={{background:'#F0F4F9',borderRadius:'12px',padding:'12px',marginBottom:'16px',maxHeight:'200px',overflowY:'auto'}}>
                  {Object.entries(scanResult.fields).filter(([k,v])=>v&&k!=='confidence').map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(27,42,74,.06)',fontSize:'12px'}}>
                      <span style={{color:'#6B7A90',fontWeight:600}}>{FIELD_LABELS[k]||k}</span>
                      <span style={{fontFamily:'DM Mono, monospace',fontWeight:700,color:NAVY,maxWidth:'55%',textAlign:'right',fontSize:'11px'}}>{typeof v==='object'?JSON.stringify(v):String(v)}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>setScanModal(false)} style={{flex:1,background:'rgba(27,42,74,.06)',color:NAVY,border:'1px solid rgba(27,42,74,.15)',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-manrope), Manrope, sans-serif'}}>
                    Ignore
                  </button>
                  <button onClick={applyScan} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',flex:2,background:TEAL,color:'white',border:'none',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-manrope), Manrope, sans-serif',boxShadow:'0 4px 14px rgba(10,122,106,.3)'}}>
                    <CircleCheck size={15} strokeWidth={1.9}/> Aplike valè yo
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}