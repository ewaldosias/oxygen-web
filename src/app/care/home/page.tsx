'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Medication { time: string; drugs: string; done: boolean }
type Lang = 'ht' | 'fr' | 'en'

const MEDS: Medication[] = [
  { time:'7h00',  drugs:'Amlodipine 5mg · Losartan 50mg · Aspirine 100mg', done:true  },
  { time:'13h00', drugs:'Metformine 500mg',                                  done:false },
  { time:'19h00', drugs:'Losartan 50mg · Metformine 500mg',                 done:false },
]

const statusColor = { ok:'#6DECB6', warn:'#FFD166', alert:'#FF8A8A' }
const statusLabel  = {
  ok:   { ht:'Nòmal',   fr:'Normal', en:'Normal' },
  warn: { ht:'Limit',   fr:'Limite', en:'Limit'  },
  alert:{ ht:'Wo anpil',fr:'Élevé',  en:'High'   },
}

/* ── MOLECULE ICONS ── */
const IconHome = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="5" fill={color}/>
    <circle cx="10" cy="10" r="3.5" fill={color}/><circle cx="38" cy="10" r="3.5" fill={color}/>
    <circle cx="10" cy="38" r="3.5" fill={color}/><circle cx="38" cy="38" r="3.5" fill={color}/>
    <line x1="13" y1="13" x2="20" y2="20" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="35" y1="13" x2="28" y2="20" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="35" x2="20" y2="28" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="35" y1="35" x2="28" y2="28" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="7" r="3" fill="#D4A843"/>
    <line x1="24" y1="10" x2="24" y2="19" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconEntry = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="5" fill={color}/>
    <circle cx="8" cy="16" r="3.5" fill={color}/><circle cx="8" cy="24" r="3.5" fill={color}/><circle cx="8" cy="32" r="3.5" fill={color}/>
    <line x1="11.5" y1="16" x2="19" y2="21" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11.5" y1="24" x2="19" y2="24" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11.5" y1="32" x2="19" y2="27" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="29" y1="24" x2="40" y2="24" stroke="#D4A843" strokeWidth="2" strokeLinecap="round"/>
    <path d="M35 19 L40 24 L35 29" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const IconHistory = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="8"  cy="38" r="3.5" fill={color}/><circle cx="17" cy="30" r="3.5" fill={color}/>
    <circle cx="26" cy="22" r="3.5" fill={color}/><circle cx="35" cy="14" r="3.5" fill="#D4A843"/>
    <line x1="11" y1="36" x2="14" y2="32" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="28" x2="23" y2="24" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="29" y1="20" x2="32" y2="16" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5"  y1="42" x2="43" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.3}/>
    <line x1="5"  y1="8"  x2="5"  y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.3}/>
  </svg>
)

const IconFamily = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="26" r="7" fill={color}/>
    <circle cx="10" cy="18" r="5" fill={color} opacity={0.7}/>
    <circle cx="38" cy="18" r="5" fill={color} opacity={0.7}/>
    <circle cx="24" cy="8"  r="3.5" fill="#D4A843"/>
    <line x1="14.5" y1="20" x2="18" y2="22" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="33.5" y1="20" x2="30" y2="22" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="24"   y1="11.5" x2="24" y2="19" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="15" y1="17" x2="33" y2="17" stroke="#D4A843" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" opacity={0.5}/>
  </svg>
)

const IconPremium = ({ size=24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="5.5" fill="#D4A843"/>
    <circle cx="24" cy="7"  r="3.5" fill="#D4A843" opacity={0.9}/>
    <circle cx="38" cy="15" r="3"   fill="#1B2A4A" opacity={0.7}/>
    <circle cx="38" cy="33" r="3"   fill="#1B2A4A" opacity={0.7}/>
    <circle cx="24" cy="41" r="3.5" fill="#D4A843" opacity={0.9}/>
    <circle cx="10" cy="33" r="3"   fill="#1B2A4A" opacity={0.7}/>
    <circle cx="10" cy="15" r="3"   fill="#1B2A4A" opacity={0.7}/>
    <line x1="24" y1="10.5" x2="24" y2="18.5" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="35.4" y1="16.7" x2="29" y2="20.5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="35.4" y1="31.3" x2="29" y2="27.5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="24" y1="37.5" x2="24" y2="29.5" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12.6" y1="31.3" x2="19" y2="27.5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="12.6" y1="16.7" x2="19" y2="20.5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const IconAlertRed = ({ size=24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="7"  r="4"   fill="#C0392B"/>
    <circle cx="7"  cy="40" r="3.5" fill="#C0392B"/>
    <circle cx="41" cy="40" r="3.5" fill="#C0392B"/>
    <line x1="21.5" y1="10.5" x2="9.5"  y2="37"  stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="26.5" y1="10.5" x2="38.5" y2="37"  stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="10.5" y1="40"   x2="37.5" y2="40"  stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="36" r="2" fill="#C0392B"/>
    <line x1="24" y1="20" x2="24" y2="31" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const IconAlertYellow = ({ size=24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="7"  r="4"   fill="#E07B2A"/>
    <circle cx="7"  cy="40" r="3.5" fill="#E07B2A"/>
    <circle cx="41" cy="40" r="3.5" fill="#E07B2A"/>
    <line x1="21.5" y1="10.5" x2="9.5"  y2="37"  stroke="#E07B2A" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="26.5" y1="10.5" x2="38.5" y2="37"  stroke="#E07B2A" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="10.5" y1="40"   x2="37.5" y2="40"  stroke="#E07B2A" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="36" r="2" fill="#E07B2A"/>
    <line x1="24" y1="20" x2="24" y2="31" stroke="#E07B2A" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const IconStreak = ({ size=24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="6" fill="#D4A843"/>
    <circle cx="24" cy="7"  r="3" fill="#D4A843" opacity={0.9}/>
    <circle cx="37" cy="13" r="2.5" fill="#D4A843" opacity={0.7}/>
    <circle cx="41" cy="28" r="2.5" fill="#D4A843" opacity={0.6}/>
    <circle cx="33" cy="40" r="2.5" fill="#D4A843" opacity={0.5}/>
    <circle cx="15" cy="40" r="2.5" fill="#D4A843" opacity={0.5}/>
    <circle cx="7"  cy="28" r="2.5" fill="#D4A843" opacity={0.6}/>
    <circle cx="11" cy="13" r="2.5" fill="#D4A843" opacity={0.7}/>
    <line x1="24" y1="10" x2="24" y2="18" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="34.5" y1="15" x2="29.5" y2="19.5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="38.5" y1="27" x2="30.5" y2="25"   stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="30.5" y1="37.5" x2="27" y2="30"   stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="17.5" y1="37.5" x2="21" y2="30"   stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="9.5"  y1="27"   x2="17.5" y2="25" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="13.5" y1="15"   x2="18.5" y2="19.5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

/* ── CANVAS HOOK for header ── */
function useMoleculeCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs = ref.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    let nodes: { x:number; y:number; vx:number; vy:number; r:number }[] = []
    let raf: number, W = 0, H = 0

    function resize() { W = cvs!.width = cvs!.offsetWidth; H = cvs!.height = cvs!.offsetHeight }
    function init() {
      nodes = []
      const count = Math.min(18, Math.floor(W * H / 10000))
      for (let i=0;i<count;i++) nodes.push({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, r:Math.random()*1.8+1 })
    }
    function tick() {
      ctx!.clearRect(0,0,W,H)
      const MAX=110
      for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
        const d=Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y)
        if (d<MAX) { ctx!.strokeStyle=`rgba(212,168,67,${(1-d/MAX)*.3})`; ctx!.lineWidth=0.8; ctx!.beginPath(); ctx!.moveTo(nodes[i].x,nodes[i].y); ctx!.lineTo(nodes[j].x,nodes[j].y); ctx!.stroke() }
      }
      nodes.forEach(n => {
        ctx!.fillStyle='rgba(255,255,255,0.2)'
        ctx!.beginPath(); ctx!.arc(n.x,n.y,n.r,0,Math.PI*2); ctx!.fill()
        n.x+=n.vx; n.y+=n.vy
        if(n.x<0||n.x>W) n.vx*=-1; if(n.y<0||n.y>H) n.vy*=-1
      })
      raf=requestAnimationFrame(tick)
    }
    resize(); init()
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) tick()
    const onResize=()=>{resize();init()}
    window.addEventListener('resize',onResize,{passive:true})
    document.addEventListener('visibilitychange',()=>{ if(document.hidden) cancelAnimationFrame(raf); else if(!reduced) tick() })
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize) }
  }, [ref])
}

export default function CareHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lang]    = useState<Lang>('ht')
  const [meds, setMeds]     = useState<Medication[]>(MEDS)
  const [streak]            = useState(14)
  const [showAlert, setShowAlert] = useState(true)

  useMoleculeCanvas(canvasRef)

  function toggleMed(idx:number) {
    setMeds(prev=>prev.map((m,i)=>i===idx?{...m,done:!m.done}:m))
  }

  const sl = statusLabel
  const TODAY = { ta:'148/92', taStatus:'warn' as const, gly:'108', glyStatus:'ok' as const, weight:'68' }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F4F9', fontFamily:'DM Sans, sans-serif', paddingBottom:'100px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes breathe { 0%,100%{transform:scale(1);filter:drop-shadow(0 0 0px rgba(212,168,67,0))} 50%{transform:scale(1.06);filter:drop-shadow(0 0 10px rgba(212,168,67,0.4))} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .bohr-breathe { animation: breathe 4.5s ease-in-out infinite; }
        .c1{animation:fadeUp .5s ease .05s forwards;opacity:0}
        .c2{animation:fadeUp .5s ease .12s forwards;opacity:0}
        .c3{animation:fadeUp .5s ease .19s forwards;opacity:0}
        .c4{animation:fadeUp .5s ease .26s forwards;opacity:0}
        .qa-card { transition: transform .15s; }
        .qa-card:active { transform: scale(0.97); }
        .med-row { transition: background .2s; cursor:pointer; }
        @media (prefers-reduced-motion:reduce) { .bohr-breathe,.c1,.c2,.c3,.c4{animation:none;opacity:1} }
      `}</style>

      {/* ── HEADER with canvas inside ── */}
      <div style={{ background:'linear-gradient(150deg,#065C50 0%,#0A7A6A 100%)', borderRadius:'0 0 28px 28px', padding:'52px 22px 22px', position:'relative', overflow:'hidden', marginBottom:'16px' }}>

        {/* Canvas INSIDE header — visible through gradient */}
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}/>

        {/* Gradient overlay to keep text readable */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(150deg,rgba(6,92,80,0.7) 0%,rgba(10,122,106,0.6) 100%)', zIndex:1, pointerEvents:'none' }}/>

        {/* Content above canvas */}
        <div style={{ position:'relative', zIndex:2 }}>
          {/* Top row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
    
              <div>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'11px', fontWeight:400, color:'rgba(255,255,255,0.5)', letterSpacing:'0.5px', marginBottom:'3px' }}>Oxy<span style={{ color:'#D4A843' }}>Gen</span> Care</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', fontWeight:500, marginBottom:'1px' }}>Bonjou,</div>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'22px', fontWeight:500, color:'white', lineHeight:1 }}>Madame Marie</div>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:'10px', padding:'6px 11px', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.45)', fontWeight:700, letterSpacing:'1px', marginBottom:'1px' }}>ID</div>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:'12px', color:'rgba(255,255,255,0.85)', fontWeight:500 }}>OXC-0000847</div>
            </div>
          </div>

          {/* Today's values */}
          <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(12px)', borderRadius:'18px', padding:'14px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase' }}>Jodi a · Vandredi 16 me</div>
              <div style={{ fontSize:'9px', color:'rgba(212,168,67,0.8)', fontWeight:700 }}>09:41</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
              {[
                { label:'TANSYON', value:TODAY.ta,     unit:'mmHg',  status:TODAY.taStatus  },
                { label:'SIK',     value:TODAY.gly,    unit:'mg/dL', status:TODAY.glyStatus },
                { label:'PWA',     value:TODAY.weight, unit:'kg',    status:'ok' as const   },
              ].map(item => (
                <div key={item.label} style={{ background:'rgba(255,255,255,0.08)', borderRadius:'13px', padding:'10px 9px', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:'8px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px' }}>{item.label}</div>
                  <div style={{ fontFamily:'DM Mono, monospace', fontSize:item.label==='TANSYON'?'15px':'20px', fontWeight:700, color:statusColor[item.status], lineHeight:1, marginBottom:'3px' }}>{item.value}</div>
                  <div style={{ fontSize:'8px', color:'rgba(255,255,255,0.3)', marginBottom:'3px' }}>{item.unit}</div>
                  <div style={{ fontSize:'9px', fontWeight:700, color:statusColor[item.status] }}>{sl[item.status][lang]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:'0 16px' }}>

        {/* Yellow alert */}
        {showAlert && (
          <div className="c1" style={{ background:'white', borderRadius:'16px', borderLeft:'3px solid #E07B2A', padding:'13px 14px', marginBottom:'12px', display:'flex', gap:'12px', alignItems:'flex-start', boxShadow:'0 2px 12px rgba(224,123,42,0.08)' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'rgba(224,123,42,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <IconAlertYellow size={20}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#E07B2A', marginBottom:'3px' }}>Tansyon limit depi 3 jou</div>
              <div style={{ fontSize:'11px', color:'#374151', lineHeight:1.5 }}>Ale wè doktè nenpòt sentom ou santi.</div>
            </div>
            <button onClick={()=>setShowAlert(false)} style={{ background:'none', border:'none', color:'rgba(0,0,0,0.2)', cursor:'pointer', padding:'2px', fontSize:'18px', lineHeight:1, flexShrink:0 }}>×</button>
          </div>
        )}

        {/* Sa m ap swiv */}
        <div className="c1" style={{ marginBottom:'12px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1.5px', color:'#6B7A90', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'2px' }}>Sa m ap swiv</div>
          <div style={{ display:'flex', gap:'8px' }}>
            {[
              { label:'❤ HTA',    active:true  },
              { label:'◉ Dyabèt', active:true  },
              { label:'+ Ajoute', active:false },
            ].map(chip=>(
              <div key={chip.label} style={{ background:chip.active?'rgba(10,122,106,0.08)':'white', border:`1.5px solid ${chip.active?'rgba(10,122,106,0.25)':'rgba(27,42,74,0.1)'}`, borderRadius:'30px', padding:'7px 14px', fontSize:'12px', fontWeight:600, color:chip.active?'#0A7A6A':'#6B7A90', cursor:'pointer' }}>
                {chip.label}
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="c2" style={{ marginBottom:'12px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1.5px', color:'#6B7A90', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'2px' }}>Aksyon rapid</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              { icon:<IconEntry size={22} color="#0A7A6A"/>,   label:'Antre chif jodi a', bg:'rgba(10,122,106,0.08)',  border:'rgba(10,122,106,0.2)',  href:'/care/entry'   },
              { icon:<IconHistory size={22} color="#1B2A4A"/>, label:'Wè istorik mwen',  bg:'rgba(27,42,74,0.05)',    border:'rgba(27,42,74,0.12)',   href:'/care/history' },
              { icon:<IconFamily size={22} color="#1B2A4A"/>,  label:'Rapò pou fanmi',  bg:'rgba(212,168,67,0.08)', border:'rgba(212,168,67,0.2)', href:'/care/family'  },
              { icon:<IconPremium size={22}/>,                 label:'Vin Premium',      bg:'rgba(212,168,67,0.08)', border:'rgba(212,168,67,0.2)', href:'/care/premium' },
            ].map(qa=>(
              <Link key={qa.label} href={qa.href} style={{ background:'white', border:`1px solid ${qa.border}`, borderRadius:'16px', padding:'14px 13px', display:'flex', alignItems:'center', gap:'11px', textDecoration:'none', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }} className="qa-card">
                <div style={{ width:'36px', height:'36px', borderRadius:'11px', background:qa.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {qa.icon}
                </div>
                <div style={{ fontSize:'12px', fontWeight:600, color:'#1A2332', lineHeight:1.35 }}>{qa.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="c3" style={{ marginBottom:'12px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1.5px', color:'#6B7A90', textTransform:'uppercase', marginBottom:'8px', paddingLeft:'2px' }}>Medikaman jodi a</div>
          <div style={{ background:'white', borderRadius:'18px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', border:'1px solid rgba(27,42,74,0.07)' }}>
            {meds.map((med,idx)=>(
              <div key={idx} className="med-row" onClick={()=>toggleMed(idx)} style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:'14px', borderBottom:idx<meds.length-1?'1px solid rgba(27,42,74,0.06)':'none', background:med.done?'rgba(10,122,106,0.02)':'white' }}>
                <div style={{ fontFamily:'DM Mono, monospace', fontSize:'12px', fontWeight:600, color:med.done?'#0A7A6A':'#6B7A90', minWidth:'42px' }}>{med.time}</div>
                <div style={{ flex:1, fontSize:'12px', color:med.done?'#6B7A90':'#1A2332', lineHeight:1.45, textDecoration:med.done?'line-through':'none', fontWeight:med.done?400:500 }}>{med.drugs}</div>
                <div style={{ width:'24px', height:'24px', borderRadius:'8px', border:`2px solid ${med.done?'#0A7A6A':'rgba(27,42,74,0.15)'}`, background:med.done?'#0A7A6A':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
                  {med.done&&<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak */}
        <div className="c4">
          <div style={{ background:'white', borderRadius:'18px', padding:'16px 18px', display:'flex', alignItems:'center', gap:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', border:'1px solid rgba(27,42,74,0.07)' }}>
            <IconStreak size={40}/>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'28px', fontWeight:500, color:'#1A2332', lineHeight:1 }}>{streak} jou</div>
              <div style={{ fontSize:'12px', color:'#6B7A90', marginTop:'3px' }}>Kontinye konsa Madame Marie !</div>
            </div>
            <div style={{ background:'rgba(212,168,67,0.12)', border:'1px solid rgba(212,168,67,0.25)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', fontWeight:700, color:'#8C6B00' }}>Rekò</div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'430px', background:'white', borderTop:'1px solid rgba(27,42,74,0.08)', display:'flex', padding:'10px 0 24px', zIndex:50, boxShadow:'0 -4px 20px rgba(0,0,0,0.06)' }}>
        {[
          { icon:<IconHome size={22} color="#0A7A6A"/>,   label:'Akèy',       href:'/care/home',    active:true  },
          { icon:<IconEntry size={22} color="#6B7A90"/>,  label:'Antre chif', href:'/care/entry',   active:false },
          { icon:<IconHistory size={22} color="#6B7A90"/>,label:'Istorik',    href:'/care/history', active:false },
          { icon:<IconFamily size={22} color="#6B7A90"/>, label:'Fanmi',      href:'/care/family',  active:false },
          { icon:<IconPremium size={22}/>,                label:'Premium',    href:'/care/premium', active:false },
        ].map(tab=>(
          <Link key={tab.label} href={tab.href} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', textDecoration:'none' }}>
            <div style={{ width:'48px', height:'28px', borderRadius:'14px', background:tab.active?'rgba(10,122,106,0.1)':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {tab.icon}
            </div>
            <div style={{ fontSize:'10px', fontWeight:tab.active?700:500, color:tab.active?'#0A7A6A':'#6B7A90', letterSpacing:'0.2px' }}>{tab.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}