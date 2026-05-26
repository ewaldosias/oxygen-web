'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const TEAL = '#0A7A6A'
const NAVY = '#1B2A4A'
const GOLD = '#D4A843'

/* ── MOLECULE CANVAS ── */
function useMolCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs=ref.current; if(!cvs) return
    const ctx=cvs.getContext('2d'); if(!ctx) return
    let nodes:{x:number;y:number;vx:number;vy:number;r:number}[]=[],raf:number,W=0,H=0
    function resize(){W=cvs!.width=cvs!.offsetWidth;H=cvs!.height=cvs!.offsetHeight}
    function init(){nodes=[];const c=Math.min(16,Math.floor(W*H/9000));for(let i=0;i<c;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.8+1})}
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

/* ── DEMO DATA ── */
interface Patient {
  id: string
  name: string
  oxcId: string
  age: string
  condition: string
  specialty: string
  taSys: number | null
  taDia: number | null
  gly: number | null
  lastEntry: string
  missing: boolean
  streak: number
  status: 'ok' | 'warn' | 'alert' | 'critical'
}

const DEMO_PATIENTS: Patient[] = [
  { id:'1', name:'Marie Jeanne Louis',   oxcId:'OXC-0000847', age:'58 an', condition:'HTA + Dyabèt', specialty:'medecine_interne', taSys:162, taDia:98,  gly:187, lastEntry:'Jodi a 07h12', missing:false, streak:14, status:'alert'    },
  { id:'2', name:'Jean-Pierre Osias',    oxcId:'OXC-0000412', age:'45 an', condition:'HTA',           specialty:'medecine_interne', taSys:138, taDia:85,  gly:null,lastEntry:'Yè 08h30',   missing:false, streak:22, status:'ok'       },
  { id:'3', name:'Rachilde Saint-Fleur', oxcId:'OXC-0000613', age:'32 an', condition:'Gwosès 28 sem', specialty:'obstetrique',      taSys:142, taDia:92,  gly:null,lastEntry:'Jodi a 09h00',missing:false, streak:8,  status:'warn'     },
  { id:'4', name:'Claudette Toussaint',  oxcId:'OXC-0000291', age:'67 an', condition:'Glokòm',        specialty:'ophtalmologie',    taSys:null,taDia:null, gly:null,lastEntry:'Yè 14h20',   missing:false, streak:5,  status:'ok'       },
  { id:'5', name:'Ernst Belizaire',      oxcId:'OXC-0000534', age:'52 an', condition:'Dyabèt Tip 2',  specialty:'medecine_interne', taSys:null,taDia:null, gly:null,lastEntry:'Pa antre',    missing:true,  streak:0,  status:'warn'     },
  { id:'6', name:'Nadège Pierre-Louis',  oxcId:'OXC-0000728', age:'29 an', condition:'Gwosès 36 sem', specialty:'obstetrique',      taSys:158, taDia:102, gly:null,lastEntry:'Jodi a 06h45',missing:false, streak:31, status:'critical' },
]

const STATUS_COLOR: Record<string,string>  = { ok:'#1A8A4A', warn:'#E07B2A', alert:'#C0392B', critical:'#7B0D1E' }
const STATUS_LABEL: Record<string,string>  = { ok:'Nòmal', warn:'Swiv', alert:'Ijan', critical:'Kriz' }
const STATUS_BG: Record<string,string>     = { ok:'rgba(26,138,74,.1)', warn:'rgba(224,123,42,.1)', alert:'rgba(192,57,43,.1)', critical:'rgba(123,13,30,.12)' }

const SPECIALTY_LABEL: Record<string,string> = {
  medecine_interne:'Medsin Entèn',
  obstetrique:'Obstetrik',
  ophtalmologie:'Oftalmo',
  general:'Jeneral'
}

type TabKey = 'patients' | 'alerts' | 'profile'

export default function DoctorHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMolCanvas(canvasRef)

  const [tab,         setTab]         = useState<TabKey>('patients')
  const [filter,      setFilter]      = useState<string>('all')
  const [showInvite,  setShowInvite]  = useState(false)
  const [inviteName,  setInviteName]  = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteCond,  setInviteCond]  = useState('')
  const [inviteSent,  setInviteSent]  = useState(false)

  // Stats
  const total    = DEMO_PATIENTS.length
  const alerts   = DEMO_PATIENTS.filter(p=>p.status==='alert'||p.status==='critical').length
  const missing  = DEMO_PATIENTS.filter(p=>p.missing).length
  const critical = DEMO_PATIENTS.filter(p=>p.status==='critical')

  // Filtered patients
  const filtered = filter === 'all'
    ? DEMO_PATIENTS
    : filter === 'alerts'
    ? DEMO_PATIENTS.filter(p=>p.status==='alert'||p.status==='critical')
    : filter === 'missing'
    ? DEMO_PATIENTS.filter(p=>p.missing)
    : DEMO_PATIENTS.filter(p=>p.specialty===filter)

  async function handleInvite() {
    await new Promise(r=>setTimeout(r,800))
    setInviteSent(true)
    setTimeout(()=>{setShowInvite(false);setInviteSent(false);setInviteName('');setInvitePhone('');setInviteCond('')},2000)
  }

  return (
    <div style={{minHeight:'100vh',background:'#F0F4F9',fontFamily:'DM Sans, sans-serif',paddingBottom:'100px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .c1{animation:fadeUp .4s ease .05s forwards;opacity:0}
        .c2{animation:fadeUp .4s ease .1s forwards;opacity:0}
        .c3{animation:fadeUp .4s ease .15s forwards;opacity:0}
        .tb{transition:all .15s;cursor:pointer}.tb:active{opacity:.8}
        .card{transition:transform .15s,box-shadow .15s}.card:active{transform:scale(0.99)}
        .sheet{animation:modalIn .35s cubic-bezier(0.34,1.1,0.64,1) forwards}
        .pulse{animation:pulse 2s ease-in-out infinite}
        @media(prefers-reduced-motion:reduce){.c1,.c2,.c3,.sheet{animation:none;opacity:1}.pulse{animation:none}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(150deg,${NAVY} 0%,#2D4A6B 100%)`,borderRadius:'0 0 24px 24px',padding:'52px 20px 18px',marginBottom:'14px',position:'relative',overflow:'hidden'}}>
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(150deg,rgba(27,42,74,.65) 0%,rgba(45,74,107,.55) 100%)',zIndex:1,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2}}>

          {/* Top row */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'18px'}}>
            <div>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'11px',fontWeight:400,color:'rgba(255,255,255,.5)',letterSpacing:'.5px',marginBottom:'3px'}}>
                Oxy<span style={{color:GOLD}}>Gen</span> Care
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.45)',marginBottom:'3px'}}>Bonjou,</div>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'22px',fontWeight:500,color:'white',lineHeight:1}}>Dr. Jean Pierre</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginTop:'3px'}}>
                {SPECIALTY_LABEL['medecine_interne']} · {total} pasyan
              </div>
            </div>
            {/* Add patient button */}
            <button onClick={()=>setShowInvite(true)} style={{background:`rgba(212,168,67,.2)`,border:`1px solid ${GOLD}`,borderRadius:'12px',padding:'9px 14px',color:GOLD,fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',display:'flex',alignItems:'center',gap:'6px',flexShrink:0}}>
              <span style={{fontSize:'16px'}}>+</span> Ajoute pasyan
            </button>
          </div>

          {/* Stats row */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'16px'}}>
            {[
              { label:'Total',   value:total,   color:'rgba(255,255,255,.9)', bg:'rgba(255,255,255,.08)' },
              { label:'Alèt',    value:alerts,  color:alerts>0?'#FF8A8A':'rgba(255,255,255,.5)', bg:alerts>0?'rgba(192,57,43,.2)':'rgba(255,255,255,.08)' },
              { label:'Pa antre',value:missing, color:missing>0?GOLD:'rgba(255,255,255,.5)', bg:missing>0?'rgba(212,168,67,.15)':'rgba(255,255,255,.08)' },
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,borderRadius:'12px',padding:'10px 12px',textAlign:'center',border:'1px solid rgba(255,255,255,.08)'}}>
                <div style={{fontFamily:'DM Mono, monospace',fontSize:'22px',fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,.4)',marginTop:'3px',textTransform:'uppercase',letterSpacing:'.5px'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Critical alert banner */}
          {critical.length > 0 && (
            <div className="pulse" style={{background:'rgba(123,13,30,.3)',border:'1px solid rgba(192,57,43,.4)',borderRadius:'12px',padding:'10px 14px',display:'flex',alignItems:'center',gap:'10px'}}>
              <span style={{fontSize:'16px'}}>🚨</span>
              <div style={{flex:1}}>
                <div style={{fontSize:'12px',fontWeight:700,color:'#FF8A8A'}}>KRIZ — Atansyon imedyat</div>
                <div style={{fontSize:'11px',color:'rgba(255,138,138,.7)',marginTop:'2px'}}>{critical.map(p=>p.name.split(' ')[0]).join(', ')} — tansyon kritik</div>
              </div>
              <button style={{background:'#C0392B',color:'white',border:'none',borderRadius:'8px',padding:'6px 12px',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>Wè</button>
            </div>
          )}
        </div>
      </div>

      <div style={{padding:'0 16px'}}>

        {/* ── FILTER CHIPS ── */}
        <div className="c1" style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'4px',marginBottom:'12px',scrollbarWidth:'none'}}>
          {[
            { key:'all',              label:`Tout (${total})` },
            { key:'alerts',           label:`🚨 Alèt (${alerts})` },
            { key:'missing',          label:`⚠ Pa antre (${missing})` },
            { key:'medecine_interne', label:'🫀 Medsin Entèn' },
            { key:'obstetrique',      label:'🤰 Obstetrik' },
            { key:'ophtalmologie',    label:'👁️ Oftalmo' },
          ].map(f=>(
            <button key={f.key} className="tb" onClick={()=>setFilter(f.key)} style={{padding:'6px 14px',borderRadius:'20px',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',whiteSpace:'nowrap',border:`1px solid ${filter===f.key?NAVY:'rgba(27,42,74,.12)'}`,background:filter===f.key?NAVY:'white',color:filter===f.key?'white':'#6B7A90',flexShrink:0,transition:'all .15s'}}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── PATIENT LIST ── */}
        <div className="c2">
          {filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'40px 20px',color:'#6B7A90'}}>
              <div style={{fontSize:'32px',marginBottom:'10px'}}>🔍</div>
              <div style={{fontSize:'14px',fontWeight:600}}>Pa gen pasyan nan kategori sa</div>
            </div>
          ) : filtered.map((p,idx)=>(
            <div key={p.id} className="card" style={{background:'white',borderRadius:'18px',border:`1px solid ${p.status==='critical'?'rgba(192,57,43,.3)':p.status==='alert'?'rgba(192,57,43,.15)':'rgba(27,42,74,.07)'}`,overflow:'hidden',marginBottom:'10px',boxShadow:`0 1px 4px rgba(0,0,0,.04)${p.status==='critical'?',0 0 0 2px rgba(192,57,43,.15)':''}`,cursor:'pointer'}}>

              {/* Patient header */}
              <div style={{background:`linear-gradient(135deg,${p.status==='critical'?'#7B0D1E':p.status==='alert'?'#8B2317':NAVY} 0%,${p.status==='critical'?'#A01020':p.status==='alert'?'#C0392B':'#2D4A6B'} 100%)`,padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>
                  {p.specialty==='obstetrique'?'🤰':p.specialty==='ophtalmologie'?'👁️':'👤'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'13px',fontWeight:700,color:'white',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,.45)',marginTop:'2px'}}>{p.age} · {p.condition} · {p.oxcId}</div>
                </div>
                <div style={{background:STATUS_BG[p.status],borderRadius:'20px',padding:'4px 10px',border:`1px solid ${STATUS_COLOR[p.status]}40`,flexShrink:0}}>
                  <div style={{fontSize:'10px',fontWeight:700,color:STATUS_COLOR[p.status]}}>{STATUS_LABEL[p.status]}</div>
                </div>
              </div>

              {/* Patient data */}
              <div style={{padding:'12px 16px'}}>
                {p.missing ? (
                  <div style={{background:'rgba(224,168,42,.08)',border:'1px solid rgba(224,168,42,.2)',borderRadius:'10px',padding:'10px 14px',display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'18px'}}>⚠</span>
                    <div>
                      <div style={{fontSize:'12px',fontWeight:700,color:'#E07B2A'}}>Chif pa antre jodi a</div>
                      <div style={{fontSize:'11px',color:'rgba(27,42,74,.5)',marginTop:'2px'}}>Dènye antre: {p.lastEntry}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                    {/* TA */}
                    <div style={{background:'#F0F4F9',borderRadius:'10px',padding:'9px',textAlign:'center'}}>
                      <div style={{fontSize:'8px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'4px'}}>TANSYON</div>
                      {p.taSys && p.taDia ? (
                        <>
                          <div style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:STATUS_COLOR[p.status],lineHeight:1}}>{p.taSys}/{p.taDia}</div>
                          <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>mmHg</div>
                        </>
                      ) : (
                        <div style={{fontSize:'11px',color:'rgba(27,42,74,.25)',fontWeight:500}}>—</div>
                      )}
                    </div>
                    {/* GLY */}
                    <div style={{background:'#F0F4F9',borderRadius:'10px',padding:'9px',textAlign:'center'}}>
                      <div style={{fontSize:'8px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'4px'}}>SIK</div>
                      {p.gly ? (
                        <>
                          <div style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:p.gly>180?'#C0392B':'#1A8A4A',lineHeight:1}}>{p.gly}</div>
                          <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>mg/dL</div>
                        </>
                      ) : (
                        <div style={{fontSize:'11px',color:'rgba(27,42,74,.25)',fontWeight:500}}>—</div>
                      )}
                    </div>
                    {/* STREAK */}
                    <div style={{background:'#F0F4F9',borderRadius:'10px',padding:'9px',textAlign:'center'}}>
                      <div style={{fontSize:'8px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'4px'}}>SERI</div>
                      <div style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:p.streak>20?GOLD:NAVY,lineHeight:1}}>{p.streak}</div>
                      <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>jou</div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'10px'}}>
                  <div style={{fontSize:'10px',color:'rgba(27,42,74,.4)'}}>
                    {p.missing ? '' : `Dènye: ${p.lastEntry}`}
                  </div>
                  <div style={{display:'flex',gap:'6px'}}>
                    {/* WhatsApp */}
                    <button style={{background:'#25D366',color:'white',border:'none',borderRadius:'8px',padding:'6px 10px',fontSize:'10px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',display:'flex',alignItems:'center',gap:'4px'}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                      WA
                    </button>
                    {/* View detail */}
                    <button style={{background:NAVY,color:'white',border:'none',borderRadius:'8px',padding:'6px 10px',fontSize:'10px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>
                      Wè →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVITE BOTTOM SHEET ── */}
      {showInvite&&(
        <>
          <div onClick={()=>setShowInvite(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:200,backdropFilter:'blur(4px)'}}/>
          <div className="sheet" style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',zIndex:201,background:'white',borderRadius:'24px 24px 0 0',padding:'24px 24px 48px'}}>
            <div style={{width:'36px',height:'4px',background:'rgba(0,0,0,.1)',borderRadius:'2px',margin:'0 auto 20px'}}/>
            <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'24px',fontWeight:500,color:NAVY,marginBottom:'5px'}}>Ajoute yon pasyan</div>
            <div style={{fontSize:'13px',color:'#6B7A90',marginBottom:'24px',lineHeight:1.6}}>Y ap resevwa yon lyen WhatsApp pou kreye kont yo.</div>

            {inviteSent ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>✅</div>
                <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:500,color:TEAL}}>Envitasyon voye !</div>
                <div style={{fontSize:'13px',color:'#6B7A90',marginTop:'6px'}}>Lyen WhatsApp voye bay {inviteName}</div>
              </div>
            ) : (
              <>
                {/* Name */}
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'6px'}}>Non pasyan an</div>
                  <input value={inviteName} onChange={e=>setInviteName(e.target.value)} placeholder="Ex: Marie Jean" style={{width:'100%',border:'1.5px solid rgba(27,42,74,.15)',borderRadius:'12px',padding:'13px 16px',fontSize:'15px',color:NAVY,fontFamily:'DM Sans, sans-serif',outline:'none'}}/>
                </div>
                {/* Phone */}
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'6px'}}>Nimewo telefòn</div>
                  <input value={invitePhone} onChange={e=>setInvitePhone(e.target.value)} placeholder="+509 XXXX XXXX" type="tel" style={{width:'100%',border:'1.5px solid rgba(27,42,74,.15)',borderRadius:'12px',padding:'13px 16px',fontSize:'15px',color:NAVY,fontFamily:'DM Mono, monospace',outline:'none'}}/>
                </div>
                {/* Condition */}
                <div style={{marginBottom:'20px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'8px'}}>Kondisyon</div>
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {['HTA','Dyabèt','HTA + Dyabèt','Lòt'].map(c=>(
                      <button key={c} onClick={()=>setInviteCond(c)} style={{padding:'8px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans, sans-serif',border:`1px solid ${inviteCond===c?TEAL:'rgba(27,42,74,.15)'}`,background:inviteCond===c?'rgba(10,122,106,.08)':'white',color:inviteCond===c?TEAL:'#6B7A90',transition:'all .15s'}}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleInvite} disabled={!invitePhone||!inviteName} style={{width:'100%',background:invitePhone&&inviteName?'#25D366':'rgba(27,42,74,.12)',color:invitePhone&&inviteName?'white':'rgba(27,42,74,.35)',border:'none',borderRadius:'14px',padding:'15px',fontSize:'14px',fontWeight:700,cursor:invitePhone&&inviteName?'pointer':'default',fontFamily:'DM Sans, sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',transition:'all .2s'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  Voye envitasyon WhatsApp
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── TAB BAR ── */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'white',borderTop:'1px solid rgba(27,42,74,.08)',display:'flex',padding:'10px 0 24px',zIndex:50,boxShadow:'0 -4px 20px rgba(0,0,0,.06)'}}>
        {[
          { key:'patients', label:'Pasyan yo', icon:'👥' },
          { key:'alerts',   label:'Alèt',      icon:'🔔' },
          { key:'profile',  label:'Pwofil',    icon:'👨‍⚕️' },
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as TabKey)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',background:'none',border:'none',cursor:'pointer',fontFamily:'DM Sans, sans-serif',padding:'4px 0'}}>
            <div style={{width:'48px',height:'28px',borderRadius:'14px',background:tab===t.key?'rgba(27,42,74,.1)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',transition:'background .15s'}}>
              {t.icon}
            </div>
            <div style={{fontSize:'10px',fontWeight:tab===t.key?700:500,color:tab===t.key?NAVY:'#6B7A90'}}>
              {t.label}
              {t.key==='alerts'&&alerts>0&&(
                <span style={{background:'#C0392B',color:'white',borderRadius:'10px',padding:'1px 5px',fontSize:'9px',fontWeight:700,marginLeft:'4px'}}>{alerts}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}