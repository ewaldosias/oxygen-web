'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEAL = '#0A7A6A'
const NAVY = '#1B2A4A'
const GOLD = '#D4A843'

/* ── TYPES ── */
type GlyType = 'fasting' | 'post_meal' | 'random'
type FCCtx   = 'repos' | 'activite_legere' | 'effort'
type TempSite = 'axillaire' | 'oral' | 'tympanik'
type ScanType = 'vital_signs' | 'lab_result'

interface ScanResult {
  fields: Record<string, any>
  confidence: number
  fields_count: number
}

/* ── MOLECULE CANVAS ── */
function useMolCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs=ref.current; if(!cvs) return
    const ctx=cvs.getContext('2d'); if(!ctx) return
    let nodes:{x:number;y:number;vx:number;vy:number;r:number}[]=[],raf:number,W=0,H=0
    function resize(){W=cvs!.width=cvs!.offsetWidth;H=cvs!.height=cvs!.offsetHeight}
    function init(){nodes=[];const c=Math.min(14,Math.floor(W*H/9000));for(let i=0;i<c;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.8+1})}
    function tick(){
      ctx!.clearRect(0,0,W,H);const MAX=110
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);if(d<MAX){ctx!.strokeStyle=`rgba(212,168,67,${(1-d/MAX)*.3})`;ctx!.lineWidth=0.8;ctx!.beginPath();ctx!.moveTo(nodes[i].x,nodes[i].y);ctx!.lineTo(nodes[j].x,nodes[j].y);ctx!.stroke()}}
      nodes.forEach(n=>{ctx!.fillStyle='rgba(255,255,255,0.2)';ctx!.beginPath();ctx!.arc(n.x,n.y,n.r,0,Math.PI*2);ctx!.fill();n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1})
      raf=requestAnimationFrame(tick)
    }
    resize();init()
    const reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches
    if(!reduced)tick()
    const onR=()=>{resize();init()}
    window.addEventListener('resize',onR,{passive:true})
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onR)}
  },[ref])
}

/* ── TA VALIDATION ── */
function toMmHg(val: string): number {
  const n = parseFloat(val); if(isNaN(n)||n===0) return 0
  return n < 30 ? Math.round(n*10) : Math.round(n)
}
function validateTA(sys: string, dia: string): string {
  if(!sys||!dia) return ''
  const s=toMmHg(sys), d=toMmHg(dia)
  if(s<=0||d<=0) return ''
  if(s<=d) return 'Sistòl dwe toujou pi wo pase dyastòl — verifye'
  if(s<40) return 'Valè sistòl la pa reyèl, tanpri verifye chif la'
  if(s>280) return 'Valè sistòl la pa reyèl, tanpri verifye chif la'
  if(d<25) return 'Valè diastòl la pa reyèl, tanpri verifye chif la'
  if(d>160) return 'Valè diastòl la pa reyèl, tanpri verifye chif la'
  if(s-d<10) return 'Diferans ant de valè yo enposib — verifye'
  if(s-d>120) return 'Diferans ant de valè yo twò gran — verifye'
  return ''
}

function getTaStatus(sys: number, dia: number): {color:string;label:string;advice:string} {
  if(sys>=180||dia>=120) return {color:'#7B0D1E',label:'🚨 Kriz',              advice:'IJAN — rele yon doktè oswa yon lòt pwofesyonèl sante kounye a'}
  if(sys>=160||dia>=110) return {color:'#C0392B',label:'🔴 Tansyon Wo Anpil', advice:'Stage 2 HTA — Wè doktè trè vit'}
  if(sys>=140||dia>=100) return {color:'#E07B2A',label:'🟠 Tansyon Limit',    advice:'Stage 1 HTA — Swiv avèk doktè ou'}
  if(sys>=130||dia>=90)  return {color:'#E0A82A',label:'🟡 Yon ti jan wo',    advice:'Tansyon yon ti jan wo — kontinye swiv'}
  if(sys>=100&&dia>=65)  return {color:'#1A8A4A',label:'✓ Nòmal',             advice:'Bon travay — kontinye konsa'}
  if(sys>=90 ||dia>=60)  return {color:'#3AA876',label:'🔵 Ba Nòmal',         advice:'Tansyon yon ti ba — verifye si ou santi malèz'}
  if(sys>=70)            return {color:'#C0392B',label:'🔴 Ipotansyon',        advice:'Tansyon ba anpil — chita, rele doktè'}
  return                        {color:'#7B0D1E',label:'🚨 Kriz Ipotansyon',   advice:'IJAN — rele yon doktè oswa yon lòt pwofesyonèl sante kounye a'}
}

const SYMPTOMS = ['Tèt fè mal','Vizyon flou','Souf wo','Vètij','Fèbles','Nause','Doulè nan kòf','Anyen']
const EYE_SYMPTOMS = ['Vizyon flou','Doub vizyon','Doulè nan je','Wouj nan je','Gratèl je','Wonn limyè','Larèm ale','Mòch volant']

const OPHTA_RED_ALERTS = [
  { key:'perte_vision_soudaine',      label:'🚨 Pèt vizyon sibit', desc:'Ou pa wè yon sèl kote oswa toupatou — IJAN' },
  { key:'flashs_mouches_volantes',    label:'🚨 Flash + Mòch volant', desc:'Aparisyon brid sou kou — IJAN' },
  { key:'douleur_vision_cephalees',   label:'🚨 Doulè + Tèt fè mal fò', desc:'Vizyon trouble ak doulè entans — IJAN' },
]

export default function CareEntry() {
  const router    = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)
  useMolCanvas(canvasRef)

  // ── Signes vitaux
  const [taSys,     setTaSys]     = useState('')
  const [taDia,     setTaDia]     = useState('')
  const [fc,        setFc]        = useState('')
  const [fcCtx,     setFcCtx]     = useState<FCCtx>('repos')
  const [fr,        setFr]        = useState('')
  const [temp,      setTemp]      = useState('')
  const [tempSite,  setTempSite]  = useState<TempSite>('axillaire')
  const [spo2,      setSpo2]      = useState('')
  const [poids,     setPoids]     = useState('')
  const [gly,       setGly]       = useState('')
  const [glyType,   setGlyType]   = useState<GlyType>('fasting')

  // ── Labo
  const [hba1c,     setHba1c]     = useState('')
  const [creat,     setCreat]     = useState('')
  const [chol,      setChol]      = useState('')
  const [hdl,       setHdl]       = useState('')
  const [ldl,       setLdl]       = useState('')
  const [tg,        setTg]        = useState('')
  const [hemo,      setHemo]      = useState('')
  const [labDate,   setLabDate]   = useState('')

  // ── Senpòm
  const [symptoms,  setSymptoms]  = useState<string[]>([])
  const [eyeSympts, setEyeSympts] = useState<string[]>([])

  // ── Obstétrique
  const [kickCount, setKickCount] = useState('')
  const [edema,     setEdema]     = useState<boolean|null>(null)

  // ── Spécialité (hardcodé pour démo — sera lu depuis Supabase)
  const specialty = 'medecine_interne' // TODO: lire depuis care_profiles

  // ── Scan
  const [scanning,     setScanning]     = useState(false)
  const [scanModal,    setScanModal]    = useState(false)
  const [scanType,     setScanType]     = useState<ScanType>('vital_signs')
  const [scanImage,    setScanImage]    = useState('')
  const [scanResult,   setScanResult]   = useState<ScanResult|null>(null)
  const [scanPending,  setScanPending]  = useState(false)

  // ── Save
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  /* ── COMPUTED ── */
  const liveError = validateTA(taSys, taDia)
  const taSysMm   = taSys ? toMmHg(taSys) : null
  const taDiaMm   = taDia ? toMmHg(taDia) : null
  const taStatus  = taSysMm && taDiaMm && !liveError ? getTaStatus(taSysMm, taDiaMm) : null

  const today = new Date().toLocaleDateString('fr-HT', { weekday:'long', day:'numeric', month:'long' })

  /* ── SCAN HANDLER ── */
  function openScan(type: ScanType) {
    setScanType(type)
    setScanResult(null)
    setScanImage('')
    fileRef.current?.click()
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if(!file) return
    setScanPending(true); setScanModal(true)

    // Convert to base64
    const base64 = await new Promise<string>((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res((reader.result as string).split(',')[1])
      reader.onerror = rej
      reader.readAsDataURL(file)
    })

    setScanImage(`data:${file.type};base64,${base64}`)

    try {
      const resp = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, scan_type: scanType, media_type: file.type })
      })
      const data = await resp.json()
      if (data.success) {
        setScanResult(data)
      } else {
        alert('Skane pa reyisi — eseye ankò')
        setScanModal(false)
      }
    } catch {
      alert('Erè koneksyon — eseye ankò')
      setScanModal(false)
    } finally {
      setScanPending(false)
      e.target.value = ''
    }
  }

  function applyScanResult() {
    if (!scanResult) return
    const f = scanResult.fields

    // Apply vital signs
    if (f.ta_sys)      setTaSys(String(f.ta_sys))
    if (f.ta_dia)      setTaDia(String(f.ta_dia))
    if (f.fc)          setFc(String(f.fc))
    if (f.fr)          setFr(String(f.fr))
    if (f.temperature) setTemp(String(f.temperature))
    if (f.spo2)        setSpo2(String(f.spo2))
    if (f.poids)       setPoids(String(f.poids))
    if (f.glycemie)    setGly(String(f.glycemie))
    if (f.glycemie_type) setGlyType(f.glycemie_type)

    // Apply lab results
    if (f.hba1c)            setHba1c(String(f.hba1c))
    if (f.creatinine)       setCreat(String(f.creatinine))
    if (f.cholesterol_total) setChol(String(f.cholesterol_total))
    if (f.hdl)              setHdl(String(f.hdl))
    if (f.ldl)              setLdl(String(f.ldl))
    if (f.triglycerides)    setTg(String(f.triglycerides))
    if (f.hemoglobine)      setHemo(String(f.hemoglobine))
    if (f.result_date)      setLabDate(f.result_date)

    setScanModal(false)
  }

  /* ── SAVE ── */
  async function handleSave() {
    setSaving(true)
    // TODO: sauvegarder dans vital_signs_readings + lab_results
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false); setSaved(true)
    setTimeout(() => router.push('/care/home'), 1400)
  }

  const canSave = (taSys && taDia && !liveError) || gly || spo2 || temp

  /* ── FIELD ROW ── */
  function FieldRow({ label, value, setValue, unit, placeholder, type='number' }: {
    label:string; value:string; setValue:(v:string)=>void;
    unit:string; placeholder?:string; type?:string
  }) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:'1px solid rgba(27,42,74,.06)'}}>
        <div style={{flex:1,fontSize:'13px',fontWeight:600,color:NAVY}}>{label}</div>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <input type={type} value={value} onChange={e=>setValue(e.target.value)}
            placeholder={placeholder||'—'}
            style={{width:'80px',border:'1px solid rgba(27,42,74,.15)',borderRadius:'8px',padding:'7px 10px',fontFamily:'DM Mono, monospace',fontSize:'15px',fontWeight:600,color:NAVY,textAlign:'center',outline:'none'}}/>
          <div style={{fontSize:'11px',color:'#6B7A90',fontWeight:600,width:'40px'}}>{unit}</div>
        </div>
      </div>
    )
  }

  /* ── SCAN BUTTON ── */
  function ScanBtn({ type, label }: { type:ScanType; label:string }) {
    return (
      <button onClick={()=>openScan(type)} style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(10,122,106,.08)',border:'1px solid rgba(10,122,106,.2)',borderRadius:'10px',padding:'7px 12px',fontSize:'11px',fontWeight:700,color:TEAL,cursor:'pointer',fontFamily:'DM Sans, sans-serif',transition:'all .15s'}}>
        📷 {label}
      </button>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#F0F4F9',fontFamily:'DM Sans, sans-serif',paddingBottom:'100px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input:focus{outline:2px solid ${TEAL}!important;outline-offset:1px}
        .chip{transition:all .15s;cursor:pointer}.chip:active{transform:scale(.97)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes modalIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .sec{animation:fadeUp .4s ease forwards}
        .modal{animation:modalIn .3s ease forwards}
        .spin{animation:spin 1s linear infinite;display:inline-block}
        @media(prefers-reduced-motion:reduce){.sec,.modal,.spin{animation:none}}
      `}</style>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        onChange={handleFileSelect} style={{display:'none'}}/>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(150deg,#065C50 0%,${TEAL} 100%)`,borderRadius:'0 0 24px 24px',padding:'52px 20px 18px',marginBottom:'12px',position:'relative',overflow:'hidden'}}>
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(150deg,rgba(6,92,80,.65),rgba(10,122,106,.55))',zIndex:1,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2,display:'flex',alignItems:'center',gap:'12px'}}>
          <Link href="/care/home" style={{width:'32px',height:'32px',borderRadius:'10px',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none"><path d="M7 1L1 6.5L7 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Link>
          <div style={{flex:1}}>
            <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'11px',color:'rgba(255,255,255,.5)',letterSpacing:'.5px',marginBottom:'3px'}}>
              Oxy<span style={{color:GOLD}}>Gen</span> Care
            </div>
            <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'22px',fontWeight:500,color:'white',lineHeight:1}}>Antre chif jodi a</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.5)',marginTop:'2px',textTransform:'capitalize'}}>{today}</div>
          </div>
          <ScanBtn type="vital_signs" label="Skane"/>
        </div>
      </div>

      <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:'10px'}}>

        {/* ── SECTION 1 : TANSYON ── */}
        <div className="sec" style={{background:'white',borderRadius:'18px',border:`1.5px solid ${liveError?'rgba(192,57,43,.3)':taStatus?taStatus.color+'22':'rgba(27,42,74,.1)'}`,padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase'}}>❤ Tansyon</div>
            <ScanBtn type="vital_signs" label="Skane"/>
          </div>

          {/* TA fields */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginBottom:'12px'}}>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:'9px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>Sistòl</div>
              <input type="number" value={taSys} onChange={e=>setTaSys(e.target.value)} placeholder="120"
                style={{width:'100%',border:`2px solid ${liveError?'#C0392B':taSys?TEAL:'rgba(27,42,74,.12)'}`,borderRadius:'12px',padding:'12px',fontFamily:'DM Mono, monospace',fontSize:'28px',fontWeight:700,color:liveError?'#C0392B':NAVY,textAlign:'center',outline:'none',transition:'all .2s'}}/>
              {taSys && parseFloat(taSys)<30 && parseFloat(taSys)>0 && (
                <div style={{fontSize:'10px',color:TEAL,fontWeight:700,marginTop:'3px'}}>= {toMmHg(taSys)} mm</div>
              )}
            </div>
            <div style={{fontSize:'32px',color:'rgba(27,42,74,.2)',paddingBottom:'8px'}}>/</div>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:'9px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>Dyastòl</div>
              <input type="number" value={taDia} onChange={e=>setTaDia(e.target.value)} placeholder="80"
                style={{width:'100%',border:`2px solid ${liveError?'#C0392B':taDia?TEAL:'rgba(27,42,74,.12)'}`,borderRadius:'12px',padding:'12px',fontFamily:'DM Mono, monospace',fontSize:'28px',fontWeight:700,color:liveError?'#C0392B':NAVY,textAlign:'center',outline:'none',transition:'all .2s'}}/>
              {taDia && parseFloat(taDia)<30 && parseFloat(taDia)>0 && (
                <div style={{fontSize:'10px',color:TEAL,fontWeight:700,marginTop:'3px'}}>= {toMmHg(taDia)} mm</div>
              )}
            </div>
          </div>

          {/* Error or status */}
          {liveError && (
            <div style={{background:'rgba(192,57,43,.08)',border:'1px solid rgba(192,57,43,.2)',borderRadius:'10px',padding:'9px 13px',fontSize:'12px',color:'#C0392B',fontWeight:600,textAlign:'center'}}>
              ⚠ {liveError}
            </div>
          )}
          {taStatus && !liveError && (
            <div style={{background:taStatus.color+'15',borderRadius:'10px',padding:'9px 14px',textAlign:'center'}}>
              <div style={{fontSize:'13px',fontWeight:700,color:taStatus.color}}>{taStatus.label}</div>
              <div style={{fontSize:'11px',color:taStatus.color,opacity:.85,marginTop:'2px'}}>{taStatus.advice}</div>
            </div>
          )}

          {/* Hint */}
          <div style={{fontSize:'10px',color:'rgba(27,42,74,.35)',textAlign:'center',marginTop:'8px'}}>
            12/8 = 120/80 mmHg · Ou ka antre an cmHg tou
          </div>
        </div>

        {/* ── SECTION 2 : AUTRES SIGNES VITAUX ── */}
        <div className="sec" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.08)',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase'}}>💊 Siy Vital Lòt</div>
            <ScanBtn type="vital_signs" label="Skane tout"/>
          </div>

          <FieldRow label="♡ Batman kè" value={fc} setValue={setFc} unit="bpm" placeholder="72"/>

          {/* FC context */}
          {fc && (
            <div style={{display:'flex',gap:'5px',marginBottom:'4px',marginTop:'4px'}}>
              {([['repos','🛏 Repo'],['activite_legere','🚶 Lejè'],['effort','🏃 Efò']] as [FCCtx,string][]).map(([k,l])=>(
                <button key={k} className="chip" onClick={()=>setFcCtx(k)} style={{flex:1,padding:'5px',borderRadius:'8px',fontSize:'10px',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans, sans-serif',border:`1px solid ${fcCtx===k?NAVY:'rgba(27,42,74,.1)'}`,background:fcCtx===k?NAVY:'#F0F4F9',color:fcCtx===k?'white':'#6B7A90'}}>
                  {l}
                </button>
              ))}
            </div>
          )}

          <FieldRow label="🌡 Tanperati" value={temp} setValue={setTemp} unit="°C" placeholder="37.0"/>

          {/* Temp site */}
          {temp && (
            <div style={{display:'flex',gap:'5px',marginBottom:'4px',marginTop:'4px'}}>
              {([['axillaire','Anba bra'],['oral','Bouch'],['tympanik','Zòrèy']] as [TempSite,string][]).map(([k,l])=>(
                <button key={k} className="chip" onClick={()=>setTempSite(k)} style={{flex:1,padding:'5px',borderRadius:'8px',fontSize:'10px',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans, sans-serif',border:`1px solid ${tempSite===k?TEAL:'rgba(27,42,74,.1)'}`,background:tempSite===k?TEAL:'#F0F4F9',color:tempSite===k?'white':'#6B7A90'}}>
                  {l}
                </button>
              ))}
            </div>
          )}

          <FieldRow label="💨 SpO2" value={spo2} setValue={setSpo2} unit="%" placeholder="98"/>
          {spo2 && parseFloat(spo2)<95 && (
            <div style={{fontSize:'11px',color:'#C0392B',fontWeight:700,marginTop:'2px',marginBottom:'4px'}}>⚠ SpO2 ba — verifye respirasyon ou</div>
          )}

          <FieldRow label="🌬 Souf (FR)" value={fr} setValue={setFr} unit="/min" placeholder="16"/>
          <FieldRow label="⚖ Pwa" value={poids} setValue={setPoids} unit="kg" placeholder="65"/>
        </div>

        {/* ── SECTION 3 : GLISEMI ── */}
        <div className="sec" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.08)',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase'}}>◉ Glisemi / Sik</div>
            <ScanBtn type="vital_signs" label="Skane glisimèt"/>
          </div>

          {/* GLY type */}
          <div style={{display:'flex',gap:'5px',marginBottom:'12px'}}>
            {([['fasting','A jen'],['post_meal','Aprè manje'],['random','Nenpòt lè']] as [GlyType,string][]).map(([k,l])=>(
              <button key={k} className="chip" onClick={()=>setGlyType(k)} style={{flex:1,padding:'7px 4px',borderRadius:'10px',fontSize:'10px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',border:`1px solid ${glyType===k?TEAL:'rgba(27,42,74,.1)'}`,background:glyType===k?TEAL:'#F0F4F9',color:glyType===k?'white':'#6B7A90'}}>
                {l}
              </button>
            ))}
          </div>

          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <input type="number" value={gly} onChange={e=>setGly(e.target.value)} placeholder="—"
              style={{flex:1,border:`2px solid ${gly?TEAL:'rgba(27,42,74,.12)'}`,borderRadius:'12px',padding:'12px',fontFamily:'DM Mono, monospace',fontSize:'28px',fontWeight:700,color:NAVY,textAlign:'center',outline:'none'}}/>
            <div style={{fontSize:'14px',color:'#6B7A90',fontWeight:600}}>mg/dL</div>
          </div>

          {gly && parseFloat(gly)<70 && (
            <div style={{marginTop:'8px',background:'rgba(192,57,43,.08)',border:'1px solid rgba(192,57,43,.2)',borderRadius:'10px',padding:'9px',textAlign:'center',fontSize:'12px',fontWeight:700,color:'#C0392B'}}>
              ⚠ Ipoglisemi / Sik ba — Kòw bezwen sik kounye a
            </div>
          )}
          {gly && parseFloat(gly)>300 && (
            <div style={{marginTop:'8px',background:'rgba(123,13,30,.08)',border:'1px solid rgba(123,13,30,.2)',borderRadius:'10px',padding:'9px',textAlign:'center',fontSize:'12px',fontWeight:700,color:'#7B0D1E'}}>
              🚨 Kriz Ipèglisemi / Sik wo — IJAN
            </div>
          )}
        </div>

        {/* ── SECTION 4 : LABO ── */}
        <div className="sec" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.08)',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase'}}>🧪 Rezilta Labo</div>
            <ScanBtn type="lab_result" label="Skane fèy labo"/>
          </div>

          {/* Date labo */}
          <div style={{marginBottom:'8px'}}>
            <div style={{fontSize:'10px',color:'#6B7A90',fontWeight:700,marginBottom:'4px',textTransform:'uppercase',letterSpacing:'.5px'}}>Dat egzamen</div>
            <input type="date" value={labDate} onChange={e=>setLabDate(e.target.value)}
              style={{width:'100%',border:'1px solid rgba(27,42,74,.15)',borderRadius:'10px',padding:'9px 12px',fontSize:'13px',color:NAVY,fontFamily:'DM Sans, sans-serif',outline:'none'}}/>
          </div>

          <FieldRow label="HbA1c"        value={hba1c}  setValue={setHba1c}  unit="%"     placeholder="—"/>
          <FieldRow label="Kreyatinin"   value={creat}  setValue={setCreat}  unit="mg/dL" placeholder="—"/>
          <FieldRow label="Kolestewòl"   value={chol}   setValue={setChol}   unit="mg/dL" placeholder="—"/>
          <FieldRow label="HDL"          value={hdl}    setValue={setHdl}    unit="mg/dL" placeholder="—"/>
          <FieldRow label="LDL"          value={ldl}    setValue={setLdl}    unit="mg/dL" placeholder="—"/>
          <FieldRow label="Trigliserid"  value={tg}     setValue={setTg}     unit="mg/dL" placeholder="—"/>
          <FieldRow label="Emoglobin"    value={hemo}   setValue={setHemo}   unit="g/dL"  placeholder="—"/>
        </div>

        {/* ── SECTION 5 : OBSTÉTRIQUE (si spécialité) ── */}
        {(specialty==='obstetrique_gyneco') && (
          <div className="sec" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.08)',padding:'16px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'12px'}}>🤰 Obstetrik</div>

            <FieldRow label="Mouvman bebe (2h)" value={kickCount} setValue={setKickCount} unit="mouvman" placeholder="10+"/>

            <div style={{marginTop:'10px'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:NAVY,marginBottom:'8px'}}>Anfleman (Edèm) ?</div>
              <div style={{display:'flex',gap:'8px'}}>
                {[{v:true,l:'Wi — gen anfleman'},{v:false,l:'Non — pa gen anfleman'}].map(o=>(
                  <button key={String(o.v)} className="chip" onClick={()=>setEdema(o.v)} style={{flex:1,padding:'10px',borderRadius:'12px',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans, sans-serif',border:`1px solid ${edema===o.v?TEAL:'rgba(27,42,74,.15)'}`,background:edema===o.v?'rgba(10,122,106,.1)':'#F0F4F9',color:edema===o.v?TEAL:NAVY}}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 6 : OPHTALMOLOGIE ── */}
        {(specialty==='ophtalmologie') && (
          <div className="sec" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.08)',padding:'16px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'10px'}}>👁️ Senpòm Je</div>

            {/* Red alerts first */}
            <div style={{marginBottom:'14px'}}>
              <div style={{fontSize:'11px',fontWeight:700,color:'#C0392B',marginBottom:'8px'}}>ALÈT WOJ — si ou gen youn nan sa yo, rele doktè ou IMEDYATMAN :</div>
              {OPHTA_RED_ALERTS.map(a=>(
                <button key={a.key} className="chip" style={{width:'100%',background:'rgba(192,57,43,.06)',border:'1px solid rgba(192,57,43,.2)',borderRadius:'12px',padding:'10px 14px',marginBottom:'6px',textAlign:'left',cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:'#C0392B'}}>{a.label}</div>
                  <div style={{fontSize:'10px',color:'rgba(192,57,43,.7)',marginTop:'2px'}}>{a.desc}</div>
                </button>
              ))}
            </div>

            {/* Symptômes yeux */}
            <div style={{fontSize:'11px',fontWeight:700,color:'#6B7A90',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'.5px'}}>Senpòm ou santi jodi a</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {EYE_SYMPTOMS.map(s=>(
                <button key={s} className="chip" onClick={()=>setEyeSympts(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s])} style={{background:eyeSympts.includes(s)?'rgba(10,122,106,.1)':'#F0F4F9',border:`1.5px solid ${eyeSympts.includes(s)?TEAL:'rgba(27,42,74,.1)'}`,borderRadius:'20px',padding:'6px 12px',fontSize:'11px',fontWeight:eyeSympts.includes(s)?700:500,color:eyeSympts.includes(s)?TEAL:'#6B7A90',cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 7 : SENPÒM GENERAUX ── */}
        <div className="sec" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.08)',padding:'16px'}}>
          <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'10px'}}>Senpòm Jeneral</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            {SYMPTOMS.map(s=>(
              <button key={s} className="chip" onClick={()=>{
                if(s==='Anyen'){setSymptoms(['Anyen']);return}
                setSymptoms(prev=>{const w=prev.filter(x=>x!=='Anyen');return w.includes(s)?w.filter(x=>x!==s):[...w,s]})
              }} style={{background:symptoms.includes(s)?'rgba(10,122,106,.1)':'#F0F4F9',border:`1.5px solid ${symptoms.includes(s)?TEAL:'rgba(27,42,74,.1)'}`,borderRadius:'30px',padding:'8px 14px',fontSize:'12px',fontWeight:symptoms.includes(s)?700:500,color:symptoms.includes(s)?TEAL:'#6B7A90',cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── SAVE ── */}
        <div className="sec" style={{paddingBottom:'16px'}}>
          <button onClick={handleSave} disabled={!canSave||saving} style={{width:'100%',background:saved?'#1A8A4A':canSave?TEAL:'rgba(27,42,74,.12)',color:canSave?'white':'rgba(27,42,74,.35)',border:'none',borderRadius:'16px',padding:'17px',fontSize:'15px',fontWeight:700,cursor:canSave?'pointer':'default',fontFamily:'DM Sans, sans-serif',boxShadow:canSave?'0 6px 20px rgba(10,122,106,.3)':'none',transition:'all .3s'}}>
            {saved?'✓ Anrejistre !':saving?'N ap anrejistre...':'Anrejistre chif yo'}
          </button>
        </div>
      </div>

      {/* ── SCAN MODAL ── */}
      {scanModal && (
        <>
          <div onClick={()=>!scanPending&&setScanModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:200,backdropFilter:'blur(4px)'}}/>
          <div className="modal" style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',zIndex:201,background:'white',borderRadius:'24px 24px 0 0',padding:'24px 24px 48px',maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{width:'36px',height:'4px',background:'rgba(0,0,0,.1)',borderRadius:'2px',margin:'0 auto 20px'}}/>

            {scanPending ? (
              <div style={{textAlign:'center',padding:'32px 0'}}>
                <div className="spin" style={{fontSize:'40px',marginBottom:'16px'}}>🔬</div>
                <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'22px',fontWeight:500,color:NAVY,marginBottom:'8px'}}>Claude ap analize imaj la...</div>
                <div style={{fontSize:'13px',color:'#6B7A90'}}>Tanpri tann yon moman</div>
              </div>
            ) : scanResult ? (
              <>
                {/* Image preview */}
                {scanImage && (
                  <div style={{marginBottom:'16px',borderRadius:'12px',overflow:'hidden',maxHeight:'200px',display:'flex',alignItems:'center',justifyContent:'center',background:'#F0F4F9'}}>
                    <img src={scanImage} alt="scan" style={{maxWidth:'100%',maxHeight:'200px',objectFit:'contain'}}/>
                  </div>
                )}

                {/* Confidence */}
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                  <div style={{flex:1,height:'6px',borderRadius:'3px',background:'rgba(27,42,74,.1)',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${scanResult.confidence*100}%`,background:scanResult.confidence>0.8?'#1A8A4A':scanResult.confidence>0.5?GOLD:'#C0392B',borderRadius:'3px'}}/>
                  </div>
                  <div style={{fontSize:'11px',fontWeight:700,color:scanResult.confidence>0.8?'#1A8A4A':scanResult.confidence>0.5?GOLD:'#C0392B'}}>
                    {Math.round(scanResult.confidence*100)}% konfyans
                  </div>
                </div>

                {/* Extracted fields */}
                <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:500,color:NAVY,marginBottom:'12px'}}>
                  {scanResult.fields_count} valè jwenn
                </div>
                <div style={{background:'#F0F4F9',borderRadius:'14px',padding:'14px',marginBottom:'20px'}}>
                  {Object.entries(scanResult.fields).map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(27,42,74,.06)',fontSize:'13px'}}>
                      <span style={{color:'#6B7A90',fontWeight:600}}>{k.replace(/_/g,' ')}</span>
                      <span style={{fontFamily:'DM Mono, monospace',fontWeight:700,color:NAVY}}>{String(v)}</span>
                    </div>
                  ))}
                </div>

                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>setScanModal(false)} style={{flex:1,background:'rgba(27,42,74,.06)',color:NAVY,border:'1px solid rgba(27,42,74,.15)',borderRadius:'12px',padding:'14px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>
                    Ignore
                  </button>
                  <button onClick={applyScanResult} style={{flex:2,background:TEAL,color:'white',border:'none',borderRadius:'12px',padding:'14px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',boxShadow:'0 4px 14px rgba(10,122,106,.3)'}}>
                    ✓ Aplike valè yo
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