'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

/* ── TYPES ── */
interface Proche {
  id: string
  name: string
  relationship: string
  location: string
  accessType: 'app' | 'whatsapp'
  active: boolean
  notifyRed: boolean
  notifyNoReading: boolean
  notifyWeekly: boolean
  lastAlert?: string
}

interface FamilyMember {
  id: string
  name: string
  oxcId: string
  relationship: string
  taSys: number | null
  taDia: number | null
  taStatus: 'ok'|'warn'|'alert'
  gly: number | null
  glyStatus: 'ok'|'warn'
  lastEntry: string
  streak: number
  missingToday: boolean
}

const statusColor: Record<string,string> = { ok:'#1A8A4A', warn:'#E07B2A', alert:'#C0392B' }
const statusLabel: Record<string,string>  = { ok:'Nòmal', warn:'Limit', alert:'Wo anpil' }

export default function CareFamily() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMolCanvas(canvasRef)

  const [tab,         setTab]         = useState<'monitor'|'myproches'>('monitor')
  const [showInvite,  setShowInvite]  = useState(false)
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteName,  setInviteName]  = useState('')
  const [inviteRel,   setInviteRel]   = useState('')
  const [inviteSent,  setInviteSent]  = useState(false)
  const [myProches,   setMyProches]   = useState<Proche[]>([])
  const [iMonitor,    setIMonitor]    = useState<FamilyMember[]>([])
  const [loading,     setLoading]     = useState(true)
  const [userName,    setUserName]    = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user name
      const { data: userData } = await supabase
        .from('users')
        .select('first_name')
        .eq('id', user.id)
        .maybeSingle()
      if (userData?.first_name) setUserName(userData.first_name)

      // Fetch proches who have access to MY data
      const { data: proches } = await supabase
        .from('care_family')
        .select('*')
        .eq('patient_id', user.id)

      if (proches) {
        setMyProches(proches.map((p: any) => ({
          id:              p.id,
          name:            p.proche_name || 'Pwòch',
          relationship:    p.relationship || 'Fanmi',
          location:        p.location || 'Ayiti',
          accessType:      p.access_type || 'whatsapp',
          active:          p.active ?? true,
          notifyRed:       p.notify_red ?? true,
          notifyNoReading: p.notify_no_reading ?? true,
          notifyWeekly:    p.notify_weekly ?? false,
          lastAlert:       p.last_alert_sent,
        })))
      }

      // Fetch people I monitor (I am the proche)
      const { data: monitored } = await supabase
        .from('care_family')
        .select(`
          id, relationship,
          patient:patient_id (
            id, first_name, oxc_id,
            vital_signs_readings (
              ta_sys, ta_dia, glycemie, recorded_at
            )
          )
        `)
        .eq('proche_user_id', user.id)
        .eq('active', true)

      if (monitored) {
        const members: FamilyMember[] = monitored
          .filter((m: any) => m.patient)
          .map((m: any) => {
            const p = m.patient
            const readings = p.vital_signs_readings || []
            const latest = readings[0]
            const taS = latest?.ta_sys && latest?.ta_dia
              ? (latest.ta_sys >= 160 ? 'alert' : latest.ta_sys >= 130 ? 'warn' : 'ok')
              : 'ok'
            return {
              id:           m.id,
              name:         p.first_name || 'Pasyan',
              oxcId:        p.oxc_id || '—',
              relationship: m.relationship || 'Fanmi',
              taSys:        latest?.ta_sys || null,
              taDia:        latest?.ta_dia || null,
              taStatus:     taS as 'ok'|'warn'|'alert',
              gly:          latest?.glycemie || null,
              glyStatus:    latest?.glycemie && latest.glycemie > 180 ? 'warn' : 'ok',
              lastEntry:    latest?.recorded_at
                ? new Date(latest.recorded_at).toLocaleDateString('fr-HT')
                : 'Pako antre',
              streak:       readings.length,
              missingToday: !latest || new Date(latest.recorded_at).toDateString() !== new Date().toDateString(),
            }
          })
        setIMonitor(members)
      }

    } catch (err) {
      console.error('family loadData error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite() {
    if (!invitePhone || !inviteName) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('care_family').insert({
        patient_id:      user.id,
        proche_name:     inviteName,
        relationship:    inviteRel || 'Fanmi',
        proche_phone:    invitePhone,
        access_type:     'whatsapp',
        active:          true,
        notify_red:      true,
        notify_no_reading: true,
        notify_weekly:   false,
        invite_sent_at:  new Date().toISOString(),
      })

      setInviteSent(true)
      setTimeout(() => {
        setShowInvite(false); setInviteSent(false)
        setInvitePhone(''); setInviteName(''); setInviteRel('')
        loadData()
      }, 2000)
    } catch (err) {
      console.error('handleInvite error:', err)
      setInviteSent(true)
      setTimeout(() => { setShowInvite(false); setInviteSent(false) }, 2000)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#F0F4F9',fontFamily:'DM Sans, sans-serif',paddingBottom:'100px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        .c1{animation:fadeUp .5s ease .05s forwards;opacity:0}
        .c2{animation:fadeUp .5s ease .12s forwards;opacity:0}
        .c3{animation:fadeUp .5s ease .19s forwards;opacity:0}
        .tb{transition:all .15s;cursor:pointer}
        .tb:active{opacity:.8}
        .card-hover{transition:transform .15s,box-shadow .15s}
        .card-hover:active{transform:scale(0.99)}
        .modal-in{animation:modalIn .35s cubic-bezier(0.34,1.1,0.64,1) forwards}
        input:focus{outline:none;border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(10,122,106,0.1)!important}
        @media(prefers-reduced-motion:reduce){.c1,.c2,.c3,.modal-in{animation:none;opacity:1}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(150deg,${NAVY} 0%,#2D4A6B 100%)`,borderRadius:'0 0 24px 24px',padding:'52px 20px 18px',marginBottom:'14px',position:'relative',overflow:'hidden'}}>
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(150deg,rgba(27,42,74,0.65) 0%,rgba(45,74,107,0.55) 100%)',zIndex:1,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px'}}>
            <Link href="/care/home" style={{width:'32px',height:'32px',borderRadius:'10px',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
              <svg width="8" height="13" viewBox="0 0 8 13" fill="none"><path d="M7 1L1 6.5L7 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </Link>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'11px',fontWeight:400,color:'rgba(255,255,255,0.5)',letterSpacing:'0.5px',marginBottom:'3px'}}>Oxy<span style={{color:GOLD}}>Gen</span> Care</div>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'22px',fontWeight:500,color:'white',lineHeight:1}}>Espas Fanmi</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)',marginTop:'2px'}}>{userName || 'Pasyan'}</div>
            </div>
            {/* Invite button */}
            <button onClick={()=>setShowInvite(true)} style={{background:'rgba(212,168,67,0.2)',border:`1px solid ${GOLD}`,borderRadius:'10px',padding:'7px 12px',color:GOLD,fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',display:'flex',alignItems:'center',gap:'5px',flexShrink:0}}>
              + Envite
            </button>
          </div>

          {/* Tab toggle */}
          <div style={{display:'flex',gap:'6px'}}>
            <button className="tb" onClick={()=>setTab('monitor')} style={{flex:1,padding:'9px',borderRadius:'12px',fontSize:'12px',fontWeight:700,fontFamily:'DM Sans, sans-serif',border:`1px solid ${tab==='monitor'?GOLD:'rgba(255,255,255,0.15)'}`,background:tab==='monitor'?'rgba(212,168,67,0.2)':'rgba(255,255,255,0.08)',color:tab==='monitor'?GOLD:'rgba(255,255,255,0.55)',transition:'all .2s'}}>
              Moun mwen ap swiv ({iMonitor.length})
            </button>
            <button className="tb" onClick={()=>setTab('myproches')} style={{flex:1,padding:'9px',borderRadius:'12px',fontSize:'12px',fontWeight:700,fontFamily:'DM Sans, sans-serif',border:`1px solid ${tab==='myproches'?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.15)'}`,background:tab==='myproches'?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.08)',color:tab==='myproches'?'white':'rgba(255,255,255,0.55)',transition:'all .2s'}}>
              Moun ki wè done mwen ({myProches.length})
            </button>
          </div>
        </div>
      </div>

      <div style={{padding:'0 16px'}}>

        {/* ── TAB: MOUN MWEN AP SWIV ── */}
        {tab==='monitor' && (
          <>
            <div className="c1" style={{fontSize:'12px',color:'#6B7A90',marginBottom:'12px',lineHeight:1.6,background:'white',borderRadius:'14px',padding:'11px 14px',border:'1px solid rgba(27,42,74,0.07)'}}>
              <span style={{fontWeight:700,color:NAVY}}>Aksè lekti sèlman.</span> Ou wè done fanmi ou — yo pa ka wè pa ou sauf si yo envite ou tou.
            </div>

            {loading ? (
              <div style={{textAlign:'center',padding:'32px',color:'#6B7A90'}}>N ap chaje...</div>
            ) : iMonitor.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px 20px',color:'#6B7A90'}}>
                <div style={{fontSize:'36px',marginBottom:'12px'}}>👨‍👩‍👧</div>
                <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:500,color:NAVY,marginBottom:'8px'}}>Pa gen moun ou ap swiv</div>
                <div style={{fontSize:'13px',lineHeight:1.6}}>Mande yon manm fanmi ki itilize OxyGen Care pou envite ou wè done li.</div>
              </div>
            ) : iMonitor.map((m,idx)=>{
              const taS = statusColor[m.taStatus]
              return (
                <div key={m.id} className={`c${idx+1} card-hover`} style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,0.07)',overflow:'hidden',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                  {/* Member header */}
                  <div style={{background:`linear-gradient(135deg,${NAVY} 0%,#2D4A6B 100%)`,padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>
                      {m.relationship==='Papa'?'👨':'👩'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'14px',fontWeight:700,color:'white'}}>{m.name}</div>
                      <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',marginTop:'1px'}}>{m.relationship} · {m.oxcId}</div>
                    </div>
                    {m.missingToday ? (
                      <div style={{background:'rgba(192,57,43,0.2)',border:'1px solid rgba(192,57,43,0.4)',borderRadius:'20px',padding:'4px 10px',fontSize:'10px',fontWeight:700,color:'#FF8A8A'}}>Pa antre</div>
                    ) : (
                      <div style={{background:'rgba(26,138,74,0.2)',border:'1px solid rgba(26,138,74,0.3)',borderRadius:'20px',padding:'4px 10px',fontSize:'10px',fontWeight:700,color:'#6DECB6'}}>Ajou ✓</div>
                    )}
                  </div>

                  {/* Values */}
                  <div style={{padding:'14px 16px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                      {/* TA */}
                      <div style={{background:'#F0F4F9',borderRadius:'12px',padding:'10px 9px',textAlign:'center'}}>
                        <div style={{fontSize:'8px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'4px'}}>TANSYON</div>
                        <div style={{fontFamily:'DM Mono, monospace',fontSize:'15px',fontWeight:700,color:taS,lineHeight:1}}>{m.taSys}/{m.taDia}</div>
                        <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>mmHg</div>
                        <div style={{fontSize:'9px',fontWeight:700,color:taS,marginTop:'2px'}}>{statusLabel[m.taStatus]}</div>
                      </div>
                      {/* GLY */}
                      <div style={{background:'#F0F4F9',borderRadius:'12px',padding:'10px 9px',textAlign:'center'}}>
                        <div style={{fontSize:'8px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'4px'}}>SIK</div>
                        <div style={{fontFamily:'DM Mono, monospace',fontSize:'15px',fontWeight:700,color:statusColor[m.glyStatus],lineHeight:1}}>{m.gly}</div>
                        <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>mg/dL</div>
                        <div style={{fontSize:'9px',fontWeight:700,color:statusColor[m.glyStatus],marginTop:'2px'}}>{statusLabel[m.glyStatus]}</div>
                      </div>
                      {/* STREAK */}
                      <div style={{background:'#F0F4F9',borderRadius:'12px',padding:'10px 9px',textAlign:'center'}}>
                        <div style={{fontSize:'8px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'4px'}}>SERI</div>
                        <div style={{fontFamily:'DM Mono, monospace',fontSize:'15px',fontWeight:700,color:NAVY,lineHeight:1}}>{m.streak}</div>
                        <div style={{fontSize:'8px',color:'#6B7A90',marginTop:'2px'}}>jou</div>
                        <div style={{fontSize:'9px',fontWeight:700,color:GOLD,marginTop:'2px'}}>🔥 Rekò</div>
                      </div>
                    </div>

                    {/* Last entry + alert if needed */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{fontSize:'11px',color:'#6B7A90'}}>Dènye antre : <span style={{fontWeight:600,color:NAVY}}>{m.lastEntry}</span></div>
                      {m.taStatus==='alert' && (
                        <div style={{fontSize:'10px',fontWeight:700,color:'#C0392B',background:'rgba(192,57,43,0.08)',padding:'3px 9px',borderRadius:'20px'}}>⚠ Tansyon wo anpil</div>
                      )}
                    </div>

                    {/* WhatsApp report button */}
                    <button style={{width:'100%',background:'#25D366',color:'white',border:'none',borderRadius:'11px',padding:'11px',fontFamily:'DM Sans, sans-serif',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',marginTop:'12px'}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                      Voye rapò bay {m.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              )
            })}

          </>
        )}

        {/* ── TAB: MOUN KI WÈ DONE MWEN ── */}
        {tab==='myproches' && (
          <>
            <div className="c1" style={{fontSize:'12px',color:'#6B7A90',marginBottom:'12px',lineHeight:1.6,background:'white',borderRadius:'14px',padding:'11px 14px',border:'1px solid rgba(27,42,74,0.07)'}}>
              <span style={{fontWeight:700,color:NAVY}}>Ou kontwole ki moun ki wè done ou.</span> Ou ka retire aksè nenpòt lè.
            </div>

            {loading ? (
              <div style={{textAlign:'center',padding:'32px',color:'#6B7A90'}}>N ap chaje...</div>
            ) : myProches.map((p,idx)=>(
              <div key={p.id} className={`c${idx+1}`} style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,0.07)',overflow:'hidden',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                {/* Proche header */}
                <div style={{background:`linear-gradient(135deg,${NAVY} 0%,#2D4A6B 100%)`,padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>
                    {p.relationship==='Fi'?'👩':'👨'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',fontWeight:700,color:'white'}}>{p.name}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',marginTop:'1px'}}>{p.relationship} · {p.location}</div>
                  </div>
                  <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                    <div style={{fontSize:'10px',fontWeight:700,color:p.accessType==='app'?'#6DECB6':'rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.1)',padding:'3px 8px',borderRadius:'20px'}}>
                      {p.accessType==='app'?'App':'WhatsApp'}
                    </div>
                    {p.active&&<div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#6DECB6',flexShrink:0}}/>}
                  </div>
                </div>

                <div style={{padding:'13px 16px'}}>
                  {/* Alert history */}
                  {p.lastAlert&&(
                    <div style={{background:'rgba(224,123,42,0.06)',border:'1px solid rgba(224,123,42,0.15)',borderRadius:'10px',padding:'8px 12px',marginBottom:'11px',fontSize:'11px',color:'#E07B2A',fontWeight:600}}>
                      📨 {p.lastAlert}
                    </div>
                  )}

                  {/* Notification prefs */}
                  <div style={{marginBottom:'12px'}}>
                    <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'8px'}}>Notifikasyon</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                      {[
                        { label:'Alèt tansyon wo (rouge)', active:p.notifyRed },
                        { label:'Chif pa antre 24h', active:p.notifyNoReading },
                        { label:'Rapò chak dimanch', active:p.notifyWeekly },
                      ].map(n=>(
                        <div key={n.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div style={{fontSize:'12px',color:'#374151'}}>{n.label}</div>
                          <div style={{width:'36px',height:'20px',borderRadius:'10px',background:n.active?TEAL:'rgba(27,42,74,0.15)',position:'relative',cursor:'pointer',transition:'background .2s'}}>
                            <div style={{position:'absolute',top:'2px',left:n.active?'18px':'2px',width:'16px',height:'16px',borderRadius:'50%',background:'white',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left .2s'}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{display:'flex',gap:'8px'}}>
                    <button style={{flex:1,background:'#25D366',color:'white',border:'none',borderRadius:'10px',padding:'10px',fontFamily:'DM Sans, sans-serif',fontSize:'11px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                      Voye rapò
                    </button>
                    <button style={{flex:1,background:'rgba(192,57,43,0.07)',color:'#C0392B',border:'1px solid rgba(192,57,43,0.2)',borderRadius:'10px',padding:'10px',fontFamily:'DM Sans, sans-serif',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                      Retire aksè
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add proche CTA */}
            <button onClick={()=>setShowInvite(true)} style={{width:'100%',background:'white',border:`1.5px dashed rgba(27,42,74,0.2)`,borderRadius:'16px',padding:'20px',fontFamily:'DM Sans, sans-serif',fontSize:'13px',fontWeight:600,color:'#6B7A90',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <span style={{fontSize:'20px',color:TEAL}}>+</span> Ajoute yon lòt moun
            </button>
          </>
        )}
      </div>

      {/* ── INVITE BOTTOM SHEET ── */}
      {showInvite&&(
        <>
          <div onClick={()=>setShowInvite(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,backdropFilter:'blur(4px)'}}/>
          <div className="modal-in" style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',zIndex:201,background:'white',borderRadius:'24px 24px 0 0',padding:'24px 24px 48px'}}>
            <div style={{width:'36px',height:'4px',background:'rgba(0,0,0,0.1)',borderRadius:'2px',margin:'0 auto 20px'}}/>
            <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'24px',fontWeight:500,color:NAVY,marginBottom:'5px'}}>Envite yon manm fanmi</div>
            <div style={{fontSize:'13px',color:'#6B7A90',marginBottom:'24px',lineHeight:1.6}}>Y ap resevwa yon lyen WhatsApp pou aksepte wè done ou yo.</div>

            {inviteSent ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>✅</div>
                <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:500,color:TEAL}}>Envitasyon voye !</div>
                <div style={{fontSize:'13px',color:'#6B7A90',marginTop:'6px'}}>Lyen WhatsApp voye bay {inviteName}</div>
              </div>
            ) : (
              <>
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'6px'}}>Prenon</div>
                  <input value={inviteName} onChange={e=>setInviteName(e.target.value)} placeholder="Ex: Josette" style={{width:'100%',border:'1.5px solid rgba(27,42,74,0.15)',borderRadius:'12px',padding:'13px 16px',fontSize:'15px',color:NAVY,fontFamily:'DM Sans, sans-serif',transition:'border-color .2s,box-shadow .2s'}}/>
                </div>
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'6px'}}>Relasyon</div>
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {['Fi','Pitit gason','Manman','Papa','Frè','Sè','Lòt'].map(r=>(
                      <button key={r} onClick={()=>setInviteRel(r)} style={{padding:'7px 13px',borderRadius:'20px',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans, sans-serif',border:`1px solid ${inviteRel===r?TEAL:'rgba(27,42,74,0.15)'}`,background:inviteRel===r?'rgba(10,122,106,0.08)':'white',color:inviteRel===r?TEAL:'#6B7A90',transition:'all .15s'}}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:'20px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'6px'}}>Nimewo telefòn</div>
                  <input value={invitePhone} onChange={e=>setInvitePhone(e.target.value)} placeholder="+509 XXXX XXXX" type="tel" style={{width:'100%',border:'1.5px solid rgba(27,42,74,0.15)',borderRadius:'12px',padding:'13px 16px',fontSize:'15px',color:NAVY,fontFamily:'DM Mono, monospace',letterSpacing:'1px',transition:'border-color .2s,box-shadow .2s'}}/>
                </div>
                <button onClick={handleInvite} disabled={!invitePhone||!inviteName} style={{width:'100%',background:invitePhone&&inviteName?'#25D366':'rgba(27,42,74,0.12)',color:invitePhone&&inviteName?'white':'rgba(27,42,74,0.35)',border:'none',borderRadius:'14px',padding:'15px',fontSize:'14px',fontWeight:700,cursor:invitePhone&&inviteName?'pointer':'default',fontFamily:'DM Sans, sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',transition:'all .2s'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  Voye envitasyon WhatsApp
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── TAB BAR ── */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'white',borderTop:'1px solid rgba(27,42,74,0.08)',display:'flex',padding:'10px 0 24px',zIndex:50,boxShadow:'0 -4px 20px rgba(0,0,0,0.06)'}}>
        {[
          { label:'Akèy',       href:'/care/home',    active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5" fill="#6B7A90"/><circle cx="10" cy="10" r="3.5" fill="#6B7A90"/><circle cx="38" cy="10" r="3.5" fill="#6B7A90"/><circle cx="10" cy="38" r="3.5" fill="#6B7A90"/><circle cx="38" cy="38" r="3.5" fill="#6B7A90"/><line x1="13" y1="13" x2="20" y2="20" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="35" y1="13" x2="28" y2="20" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="13" y1="35" x2="20" y2="28" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="35" y1="35" x2="28" y2="28" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="24" cy="7" r="3" fill="rgba(107,122,144,0.5)"/></svg> },
          { label:'Antre chif', href:'/care/entry',   active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5" fill="#6B7A90"/><circle cx="8" cy="16" r="3.5" fill="#6B7A90"/><circle cx="8" cy="24" r="3.5" fill="#6B7A90"/><circle cx="8" cy="32" r="3.5" fill="#6B7A90"/><line x1="11.5" y1="16" x2="19" y2="21" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="11.5" y1="24" x2="19" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="11.5" y1="32" x2="19" y2="27" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="29" y1="24" x2="40" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="2" strokeLinecap="round"/><path d="M35 19 L40 24 L35 29" stroke="rgba(107,122,144,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> },
          { label:'Istorik',    href:'/care/history', active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="8" cy="38" r="3.5" fill="#6B7A90"/><circle cx="17" cy="30" r="3.5" fill="#6B7A90"/><circle cx="26" cy="22" r="3.5" fill="#6B7A90"/><circle cx="35" cy="14" r="3.5" fill="#6B7A90"/><line x1="11" y1="36" x2="14" y2="32" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="28" x2="23" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="29" y1="20" x2="32" y2="16" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="42" x2="43" y2="42" stroke="rgba(107,122,144,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg> },
          { label:'Fanmi',      href:'/care/family',  active:true,  icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="26" r="7" fill={TEAL}/><circle cx="10" cy="18" r="5" fill={TEAL} opacity={0.7}/><circle cx="38" cy="18" r="5" fill={TEAL} opacity={0.7}/><circle cx="24" cy="8" r="3.5" fill={GOLD}/><line x1="14.5" y1="20" x2="18" y2="22" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="33.5" y1="20" x2="30" y2="22" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="24" y1="11.5" x2="24" y2="19" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/></svg> },
          { label:'Premium',    href:'/care/premium', active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5.5" fill="#6B7A90"/><circle cx="24" cy="7" r="3.5" fill="#6B7A90" opacity={0.6}/><circle cx="38" cy="15" r="3" fill="#6B7A90" opacity={0.5}/><circle cx="38" cy="33" r="3" fill="#6B7A90" opacity={0.5}/><circle cx="24" cy="41" r="3.5" fill="#6B7A90" opacity={0.6}/><circle cx="10" cy="33" r="3" fill="#6B7A90" opacity={0.5}/><circle cx="10" cy="15" r="3" fill="#6B7A90" opacity={0.5}/></svg> },
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