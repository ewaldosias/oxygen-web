'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Period = '7j' | '30j' | '3m'
type View   = 'ta' | 'gly'

const TEAL  = '#0A7A6A'
const NAVY  = '#1B2A4A'
const GOLD  = '#D4A843'

/* ── TYPES ── */
interface Reading {
  date:    string
  day:     string
  taSys:   number | null
  taDia:   number | null
  gly:     number | null
  glyType: string | null
  missing: boolean
}

const DAYS_HT = ['Dim','Len','Ma','Mè','Je','Van','Sam']

function formatReading(r: any): Reading {
  const d = new Date(r.recorded_at)
  const months = ['jan','fev','mas','avr','me','jen','jiy','out','sep','okt','nov','des']
  return {
    date:    `${DAYS_HT[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`,
    day:     DAYS_HT[d.getDay()],
    taSys:   r.ta_sys || null,
    taDia:   r.ta_dia || null,
    gly:     r.glycemie || null,
    glyType: r.glycemie_type || null,
    missing: false,
  }
}

function getStats(data: Reading[], view: View) {
  const vals = view === 'ta'
    ? data.filter(d=>d.taSys).map(d=>d.taSys!)
    : data.filter(d=>d.gly).map(d=>d.gly!)
  if (!vals.length) return null
  const avg = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const target = view==='ta' ? 130 : 130
  const inTarget = Math.round((vals.filter(v=>v<target).length/vals.length)*100)
  return { avg, min, max, inTarget }
}

function taStatus(sys:number, dia:number):{color:string;label:string} {
  if (sys>=180||dia>=120) return { color:'#7B0D1E', label:'Kriz'          }
  if (sys>=160||dia>=110) return { color:'#C0392B', label:'Wo anpil'      }
  if (sys>=140||dia>=100) return { color:'#E07B2A', label:'Limit'         }
  if (sys>=130||dia>=90)  return { color:'#E0A82A', label:'Yon ti jan wo' }
  if (sys>=100&&dia>=65)  return { color:'#1A8A4A', label:'Nòmal'         }
  return                         { color:'#3AA876', label:'Ba Nòmal'      }
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
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onR)}
  },[ref])
}

/* ── SVG CHART ── */
function TaChart({ data }: { data: Reading[] }) {
  const valid  = data.filter(d=>d.taSys)
  if (!valid.length) return <div style={{height:'120px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>Pa gen done</div>
  const sysVals = valid.map(d=>d.taSys!)
  const diaVals = valid.map(d=>d.taDia!)
  const allVals = [...sysVals,...diaVals]
  const minV    = Math.min(...allVals)-10
  const maxV    = Math.max(...allVals)+10
  const W=320, H=110, pad=8

  function y(v:number){ return H - pad - ((v-minV)/(maxV-minV))*(H-pad*2) }
  function x(i:number){ return pad + (i/(valid.length-1||1))*(W-pad*2) }

  const sysPoints  = sysVals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')
  const diaPoints  = diaVals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')
  const sysPath    = sysVals.map((v,i)=>`${i===0?'M':'L'}${x(i)},${y(v)}`).join(' ')
  const diaPath    = diaVals.map((v,i)=>`${i===0?'M':'L'}${x(i)},${y(v)}`).join(' ')

  // Target line at 140
  const targetY = y(140)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'120px',overflow:'visible'}}>
      {/* Target zone */}
      <rect x={pad} y={targetY} width={W-pad*2} height={H-pad-targetY} fill="rgba(26,138,74,0.06)"/>
      <line x1={pad} y1={targetY} x2={W-pad} y2={targetY} stroke="rgba(26,138,74,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
      <text x={W-pad+2} y={targetY+4} fill="rgba(26,138,74,0.6)" fontSize="8" fontFamily="DM Mono">140</text>

      {/* Systolic area */}
      <path d={`${sysPath} L${x(valid.length-1)},${H-pad} L${x(0)},${H-pad} Z`} fill="rgba(212,168,67,0.08)"/>

      {/* Lines */}
      <polyline points={diaPoints} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3"/>
      <polyline points={sysPoints} fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Dots — systolic */}
      {sysVals.map((v,i)=>{
        const s = taStatus(v, diaVals[i])
        return <circle key={i} cx={x(i)} cy={y(v)} r="4" fill={s.color} stroke="white" strokeWidth="1.5"/>
      })}

      {/* Day labels */}
      {valid.map((d,i)=>(
        <text key={i} x={x(i)} y={H+2} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Mono">{d.day}</text>
      ))}

      {/* Legend */}
      <circle cx={pad+4} cy={8} r="3" fill={GOLD}/>
      <text x={pad+10} y={12} fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="DM Sans">Sistòl</text>
      <line x1={pad+50} y1={8} x2={pad+62} y2={8} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x={pad+66} y={12} fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="DM Sans">Diastòl</text>
    </svg>
  )
}

function GlyChart({ data }: { data: Reading[] }) {
  const valid = data.filter(d=>d.gly)
  if (!valid.length) return <div style={{height:'120px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>Pa gen done</div>
  const vals = valid.map(d=>d.gly!)
  const minV = Math.min(...vals)-10
  const maxV = Math.max(...vals)+10
  const W=320,H=110,pad=8

  function y(v:number){ return H-pad-((v-minV)/(maxV-minV))*(H-pad*2) }
  function x(i:number){ return pad+(i/(valid.length-1||1))*(W-pad*2) }
  const points = vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')
  const path   = vals.map((v,i)=>`${i===0?'M':'L'}${x(i)},${y(v)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'120px',overflow:'visible'}}>
      <rect x={pad} y={y(130)} width={W-pad*2} height={y(80)-y(130)} fill="rgba(26,138,74,0.08)"/>
      <line x1={pad} y1={y(130)} x2={W-pad} y2={y(130)} stroke="rgba(26,138,74,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
      <text x={W-pad+2} y={y(130)+4} fill="rgba(26,138,74,0.6)" fontSize="8" fontFamily="DM Mono">130</text>
      <path d={`${path} L${x(valid.length-1)},${H-pad} L${x(0)},${H-pad} Z`} fill="rgba(212,168,67,0.1)"/>
      <polyline points={points} fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {vals.map((v,i)=>(
        <circle key={i} cx={x(i)} cy={y(v)} r="4" fill={v<=130?'#1A8A4A':'#E07B2A'} stroke="white" strokeWidth="1.5"/>
      ))}
      {valid.map((d,i)=>(
        <text key={i} x={x(i)} y={H+2} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Mono">{d.day}</text>
      ))}
    </svg>
  )
}

/* ================================================================
   PAGE
================================================================ */
export default function CareHistory() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMolCanvas(canvasRef)

  const [period,  setPeriod]  = useState<Period>('7j')
  const [view,    setView]    = useState<View>('ta')
  const [data,    setData]    = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDays, setTotalDays] = useState(0)

  useEffect(() => { loadData() }, [period])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const days = period === '7j' ? 7 : period === '30j' ? 30 : 90
      const from = new Date(); from.setDate(from.getDate() - days)

      const { data: readings } = await supabase
        .from('vital_signs_readings')
        .select('ta_sys, ta_dia, glycemie, glycemie_type, recorded_at')
        .eq('user_id', user.id)
        .gte('recorded_at', from.toISOString())
        .order('recorded_at', { ascending: true })

      if (readings) {
        setData(readings.map(formatReading))
        setTotalDays(readings.length)
      }
    } catch (err) {
      console.error('history loadData error:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats      = getStats(data, view)
  const avgGly     = data.filter(d=>d.gly).map(d=>d.gly!)
  const avgGlyMean = avgGly.length ? avgGly.reduce((a,b)=>a+b,0)/avgGly.length : null
  const hba1c      = avgGlyMean && totalDays >= 14 ? ((avgGlyMean+46.7)/28.7).toFixed(1) : null
  const has90d     = totalDays >= 90

  return (
    <div style={{minHeight:'100vh',background:'#F0F4F9',fontFamily:'DM Sans, sans-serif',paddingBottom:'100px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes breathe{0%,100%{transform:scale(1);filter:drop-shadow(0 0 0px rgba(212,168,67,0))}50%{transform:scale(1.06);filter:drop-shadow(0 0 10px rgba(212,168,67,0.4))}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .bb{animation:breathe 4.5s ease-in-out infinite}
        .c1{animation:fadeUp .5s ease .05s forwards;opacity:0}
        .c2{animation:fadeUp .5s ease .12s forwards;opacity:0}
        .c3{animation:fadeUp .5s ease .19s forwards;opacity:0}
        .tb{transition:all .15s;cursor:pointer}
        .tb:active{opacity:.8}
        .row-item{transition:background .15s}
        .row-item:hover{background:rgba(27,42,74,0.02)!important}
        @media(prefers-reduced-motion:reduce){.bb,.c1,.c2,.c3{animation:none;opacity:1}}
      `}</style>

      {/* ── HEADER WITH CANVAS ── */}
      <div style={{background:`linear-gradient(150deg,${NAVY} 0%,#2D4A6B 100%)`,borderRadius:'0 0 24px 24px',padding:'52px 20px 20px',marginBottom:'14px',position:'relative',overflow:'hidden'}}>
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(150deg,rgba(27,42,74,0.65) 0%,rgba(45,74,107,0.55) 100%)',zIndex:1,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2}}>
          {/* Top row */}
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px'}}>
            <Link href="/care/home" style={{width:'32px',height:'32px',borderRadius:'10px',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
              <svg width="8" height="13" viewBox="0 0 8 13" fill="none"><path d="M7 1L1 6.5L7 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </Link>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'11px',fontWeight:400,color:'rgba(255,255,255,0.5)',letterSpacing:'0.5px',marginBottom:'3px'}}>Oxy<span style={{color:GOLD}}>Gen</span> Care</div>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'22px',fontWeight:500,color:'white',lineHeight:1}}>Istorik mwen</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)',marginTop:'2px'}}>Madame Marie · OXC-0000847</div>
            </div>

          </div>

          {/* View toggle: TA vs GLY */}
          <div style={{display:'flex',gap:'6px',marginBottom:'16px'}}>
            {([['ta','❤ Tansyon'],['gly','◉ Sik']] as [View,string][]).map(([key,label])=>(
              <button key={key} className="tb" onClick={()=>setView(key)} style={{flex:1,padding:'9px',borderRadius:'12px',fontSize:'12px',fontWeight:700,fontFamily:'DM Sans, sans-serif',border:`1px solid ${view===key?GOLD:'rgba(255,255,255,0.15)'}`,background:view===key?`rgba(212,168,67,0.2)`:'rgba(255,255,255,0.08)',color:view===key?GOLD:'rgba(255,255,255,0.55)',transition:'all .2s'}}>
                {label}
              </button>
            ))}
          </div>

          {/* Period selector */}
          <div style={{display:'flex',gap:'5px',marginBottom:'16px'}}>
            {(['7j','30j','3m'] as Period[]).map(p=>(
              <button key={p} className="tb" onClick={()=>setPeriod(p)} style={{padding:'5px 16px',borderRadius:'20px',fontSize:'11px',fontWeight:700,fontFamily:'DM Sans, sans-serif',border:`1px solid ${period===p?'white':'rgba(255,255,255,0.2)'}`,background:period===p?'rgba(255,255,255,0.2)':'transparent',color:period===p?'white':'rgba(255,255,255,0.45)',transition:'all .2s'}}>
                {p}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div style={{padding:'0 4px'}}>
            {view==='ta' ? <TaChart data={data}/> : <GlyChart data={data}/>}
          </div>
        </div>
      </div>

      <div style={{padding:'0 16px'}}>

        {/* ── STATS ── */}
        {stats && (
          <div className="c1" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px',marginBottom:'12px'}}>
            {[
              { label:'Mwayèn', val: view==='ta'?`${stats.avg}`:`${stats.avg}`, unit: view==='ta'?'mmHg':'mg/dL', color: NAVY },
              { label:'Min',    val:`${stats.min}`, unit:'', color:'#1A8A4A' },
              { label:'Max',    val:`${stats.max}`, unit:'', color:'#C0392B' },
              { label:'Nan sib',val:`${stats.inTarget}%`, unit:'', color: stats.inTarget>=70?'#1A8A4A':'#E07B2A' },
            ].map(s=>(
              <div key={s.label} style={{background:'white',borderRadius:'14px',padding:'12px 10px',textAlign:'center',border:'1px solid rgba(27,42,74,0.07)',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                <div style={{fontFamily:'DM Mono, monospace',fontSize:'18px',fontWeight:700,color:s.color,lineHeight:1,marginBottom:'2px'}}>{s.val}</div>
                {s.unit && <div style={{fontSize:'9px',color:'#6B7A90',marginBottom:'2px'}}>{s.unit}</div>}
                <div style={{fontSize:'9px',fontWeight:700,color:'#6B7A90',letterSpacing:'0.5px',textTransform:'uppercase'}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── HBA1C ESTIMATED ── */}
        <div className="c2" style={{background:'white',borderRadius:'16px',border:'1px solid rgba(27,42,74,0.07)',padding:'14px 16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'rgba(10,122,106,0.08)',border:'1px solid rgba(10,122,106,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="5" fill={TEAL}/>
                <circle cx="8"  cy="38" r="3.5" fill={TEAL}/>
                <circle cx="17" cy="30" r="3.5" fill={TEAL}/>
                <circle cx="35" cy="14" r="3.5" fill={GOLD}/>
                <line x1="11" y1="36" x2="14" y2="32" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="20" y1="28" x2="23" y2="24" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="29" y1="20" x2="32" y2="16" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'3px'}}>HbA1c Estimé</div>
              {has90d && hba1c ? (
                <>
                  <div style={{fontFamily:'DM Mono, monospace',fontSize:'26px',fontWeight:700,color:TEAL,lineHeight:1}}>{hba1c}<span style={{fontSize:'14px',color:'#6B7A90',fontWeight:400}}> %</span></div>
                  <div style={{fontSize:'10px',color:'#6B7A90',marginTop:'2px'}}>Konfime ak doktè ou nan labo</div>
                </>
              ) : (
                <div>
                  <div style={{fontSize:'13px',fontWeight:600,color:'#1A2332',marginBottom:'3px'}}>Pa disponib ankò</div>
                  <div style={{height:'5px',borderRadius:'3px',background:'rgba(27,42,74,0.08)',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min((data.filter(d=>d.gly).length/90)*100,100)}%`,background:`linear-gradient(90deg,${TEAL},${GOLD})`,borderRadius:'3px',transition:'width .5s'}}/>
                  </div>
                  <div style={{fontSize:'10px',color:'#6B7A90',marginTop:'3px'}}>{data.filter(d=>d.gly).length} jou done · 90 jou nesesè</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── HISTORY LIST ── */}
        <div className="c3">
          <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'8px',paddingLeft:'2px'}}>Detay jou pa jou</div>
          <div style={{background:'white',borderRadius:'18px',overflow:'hidden',border:'1px solid rgba(27,42,74,0.07)',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            {[...data].reverse().map((d,idx)=>{
              const status = d.taSys&&d.taDia ? taStatus(d.taSys,d.taDia) : null
              return (
                <div key={idx} className="row-item" style={{padding:'13px 16px',borderBottom:idx<data.length-1?'1px solid rgba(27,42,74,0.06)':'none',display:'flex',alignItems:'center',gap:'12px',background:'white'}}>
                  {/* Status dot */}
                  <div style={{width:'10px',height:'10px',borderRadius:'50%',flexShrink:0,background:d.missing?'rgba(27,42,74,0.15)':status?status.color:'#6B7A90'}}/>

                  <div style={{flex:1,minWidth:0}}>
                    {d.missing ? (
                      <>
                        <div style={{fontSize:'12px',fontWeight:600,color:'rgba(27,42,74,0.35)',fontStyle:'italic'}}>Chif pa antre</div>
                        <div style={{fontSize:'10px',color:'#C0392B',fontWeight:600,marginTop:'2px'}}>Alèt voye bay fanmi</div>
                      </>
                    ) : (
                      <>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                          {d.taSys && d.taDia && (
                            <span style={{fontFamily:'DM Mono, monospace',fontSize:'13px',fontWeight:700,color:'#1A2332'}}>{d.taSys}/{d.taDia}</span>
                          )}
                          {d.taSys && d.taDia && status && (
                            <span style={{fontSize:'10px',fontWeight:700,color:status.color,background:`${status.color}15`,padding:'2px 7px',borderRadius:'10px'}}>{status.label}</span>
                          )}
                        </div>
                        {d.gly && (
                          <div style={{fontSize:'11px',color:'#6B7A90',marginTop:'2px'}}>
                            Sik : <span style={{fontFamily:'DM Mono, monospace',fontWeight:600,color:'#1A2332'}}>{d.gly} mg/dL</span>
                            {d.glyType && <span style={{color:'rgba(27,42,74,0.4)',marginLeft:'4px'}}>· {d.glyType==='fasting'?'a jen':d.glyType==='post_meal'?'aprè manje':'nenpòt lè'}</span>}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:'11px',fontWeight:700,color:'#6B7A90'}}>{d.day}</div>
                    <div style={{fontSize:'10px',color:'rgba(27,42,74,0.35)',marginTop:'1px'}}>{d.date.split(' ').slice(1).join(' ')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── TAB BAR ── */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'white',borderTop:'1px solid rgba(27,42,74,0.08)',display:'flex',padding:'10px 0 24px',zIndex:50,boxShadow:'0 -4px 20px rgba(0,0,0,0.06)'}}>
        {[
          { icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5" fill="#6B7A90"/><circle cx="10" cy="10" r="3.5" fill="#6B7A90"/><circle cx="38" cy="10" r="3.5" fill="#6B7A90"/><circle cx="10" cy="38" r="3.5" fill="#6B7A90"/><circle cx="38" cy="38" r="3.5" fill="#6B7A90"/><line x1="13" y1="13" x2="20" y2="20" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="35" y1="13" x2="28" y2="20" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="13" y1="35" x2="20" y2="28" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="35" y1="35" x2="28" y2="28" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="24" cy="7" r="3" fill="rgba(107,122,144,0.5)"/></svg>, label:'Akèy', href:'/care/home', active:false },
          { icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5" fill="#6B7A90"/><circle cx="8" cy="16" r="3.5" fill="#6B7A90"/><circle cx="8" cy="24" r="3.5" fill="#6B7A90"/><circle cx="8" cy="32" r="3.5" fill="#6B7A90"/><line x1="11.5" y1="16" x2="19" y2="21" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="11.5" y1="24" x2="19" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="11.5" y1="32" x2="19" y2="27" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="29" y1="24" x2="40" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="2" strokeLinecap="round"/><path d="M35 19 L40 24 L35 29" stroke="rgba(107,122,144,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>, label:'Antre chif', href:'/care/entry', active:false },
          { icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="8" cy="38" r="3.5" fill={TEAL}/><circle cx="17" cy="30" r="3.5" fill={TEAL}/><circle cx="26" cy="22" r="3.5" fill={TEAL}/><circle cx="35" cy="14" r="3.5" fill={GOLD}/><line x1="11" y1="36" x2="14" y2="32" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="28" x2="23" y2="24" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="29" y1="20" x2="32" y2="16" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="42" x2="43" y2="42" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" opacity={0.3}/></svg>, label:'Istorik', href:'/care/history', active:true },
          { icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="26" r="7" fill="#6B7A90"/><circle cx="10" cy="18" r="5" fill="#6B7A90" opacity={0.6}/><circle cx="38" cy="18" r="5" fill="#6B7A90" opacity={0.6}/><circle cx="24" cy="8" r="3.5" fill="#6B7A90" opacity={0.4}/><line x1="14.5" y1="20" x2="18" y2="22" stroke="rgba(107,122,144,0.4)" strokeWidth="1.5" strokeLinecap="round"/><line x1="33.5" y1="20" x2="30" y2="22" stroke="rgba(107,122,144,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>, label:'Fanmi', href:'/care/family', active:false },
          { icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5.5" fill="#6B7A90"/><circle cx="24" cy="7" r="3.5" fill="#6B7A90" opacity={0.6}/><circle cx="38" cy="15" r="3" fill="#6B7A90" opacity={0.5}/><circle cx="38" cy="33" r="3" fill="#6B7A90" opacity={0.5}/><circle cx="24" cy="41" r="3.5" fill="#6B7A90" opacity={0.6}/><circle cx="10" cy="33" r="3" fill="#6B7A90" opacity={0.5}/><circle cx="10" cy="15" r="3" fill="#6B7A90" opacity={0.5}/></svg>, label:'Premium', href:'/care/premium', active:false },
        ].map(tab=>(
          <Link key={tab.label} href={tab.href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',textDecoration:'none'}}>
            <div style={{width:'48px',height:'28px',borderRadius:'14px',background:tab.active?'rgba(10,122,106,0.1)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {tab.icon}
            </div>
            <div style={{fontSize:'10px',fontWeight:tab.active?700:500,color:tab.active?TEAL:'#6B7A90',letterSpacing:'0.2px'}}>{tab.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}