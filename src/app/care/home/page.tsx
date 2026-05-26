'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEAL = '#0A7A6A'
const NAVY = '#1B2A4A'
const GOLD = '#D4A843'

/* ── MOLECULE ICONS ── */
const IconHome = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="5" fill={color}/>
    <circle cx="10" cy="10" r="3.5" fill={color}/><circle cx="38" cy="10" r="3.5" fill={color}/>
    <circle cx="10" cy="38" r="3.5" fill={color}/><circle cx="38" cy="38" r="3.5" fill={color}/>
    <line x1="13" y1="13" x2="20" y2="20" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="35" y1="13" x2="28" y2="20" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="35" x2="20" y2="28" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="35" y1="35" x2="28" y2="28" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="7" r="3" fill={GOLD}/>
  </svg>
)
const IconEntry = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="5" fill={color}/>
    <circle cx="8" cy="16" r="3.5" fill={color}/><circle cx="8" cy="24" r="3.5" fill={color}/><circle cx="8" cy="32" r="3.5" fill={color}/>
    <line x1="11.5" y1="16" x2="19" y2="21" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11.5" y1="24" x2="19" y2="24" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11.5" y1="32" x2="19" y2="27" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="29" y1="24" x2="40" y2="24" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
    <path d="M35 19 L40 24 L35 29" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)
const IconHistory = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="8" cy="38" r="3.5" fill={color}/><circle cx="17" cy="30" r="3.5" fill={color}/>
    <circle cx="26" cy="22" r="3.5" fill={color}/><circle cx="35" cy="14" r="3.5" fill={GOLD}/>
    <line x1="11" y1="36" x2="14" y2="32" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="28" x2="23" y2="24" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="29" y1="20" x2="32" y2="16" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5" y1="42" x2="43" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.3}/>
  </svg>
)
const IconFamily = ({ size=24, color='#1B2A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="26" r="7" fill={color}/>
    <circle cx="10" cy="18" r="5" fill={color} opacity={0.7}/><circle cx="38" cy="18" r="5" fill={color} opacity={0.7}/>
    <circle cx="24" cy="8" r="3.5" fill={GOLD}/>
    <line x1="14.5" y1="20" x2="18" y2="22" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="33.5" y1="20" x2="30" y2="22" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="24" y1="11.5" x2="24" y2="19" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconPremium = ({ size=24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="5.5" fill={GOLD}/>
    <circle cx="24" cy="7" r="3.5" fill={GOLD} opacity={0.9}/><circle cx="38" cy="15" r="3" fill={NAVY} opacity={0.7}/>
    <circle cx="38" cy="33" r="3" fill={NAVY} opacity={0.7}/><circle cx="24" cy="41" r="3.5" fill={GOLD} opacity={0.9}/>
    <circle cx="10" cy="33" r="3" fill={NAVY} opacity={0.7}/><circle cx="10" cy="15" r="3" fill={NAVY} opacity={0.7}/>
    <line x1="24" y1="10.5" x2="24" y2="18.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="35.4" y1="16.7" x2="29" y2="20.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="35.4" y1="31.3" x2="29" y2="27.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="24" y1="37.5" x2="24" y2="29.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12.6" y1="31.3" x2="19" y2="27.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="12.6" y1="16.7" x2="19" y2="20.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

/* ── CANVAS ── */
function useMolCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs = ref.current; if (!cvs) return
    const ctx = cvs.getContext('2d'); if (!ctx) return
    let nodes: {x:number;y:number;vx:number;vy:number;r:number}[] = [], raf: number, W = 0, H = 0
    function resize() { W = cvs!.width = cvs!.offsetWidth; H = cvs!.height = cvs!.offsetHeight }
    function init() {
      nodes = []
      const c = Math.min(18, Math.floor(W * H / 10000))
      for (let i = 0; i < c; i++) nodes.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, r: Math.random()*1.8+1 })
    }
    function tick() {
      ctx!.clearRect(0, 0, W, H); const MAX = 110
      for (let i = 0; i < nodes.length; i++) for (let j = i+1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y)
        if (d < MAX) { ctx!.strokeStyle = `rgba(212,168,67,${(1-d/MAX)*.3})`; ctx!.lineWidth = 0.8; ctx!.beginPath(); ctx!.moveTo(nodes[i].x, nodes[i].y); ctx!.lineTo(nodes[j].x, nodes[j].y); ctx!.stroke() }
      }
      nodes.forEach(n => { ctx!.fillStyle = 'rgba(255,255,255,0.2)'; ctx!.beginPath(); ctx!.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx!.fill(); n.x += n.vx; n.y += n.vy; if (n.x<0||n.x>W) n.vx *= -1; if (n.y<0||n.y>H) n.vy *= -1 })
      raf = requestAnimationFrame(tick)
    }
    resize(); init()
    if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) tick()
    window.addEventListener('resize', () => { resize(); init() }, { passive: true })
    return () => { cancelAnimationFrame(raf) }
  }, [ref])
}

/* ── TA STATUS ── */
function getTaStatus(sys: number, dia: number) {
  if (sys>=180||dia>=120) return { color:'#7B0D1E', label:'🚨 Kriz',           bg:'rgba(123,13,30,.08)'   }
  if (sys>=160||dia>=110) return { color:'#C0392B', label:'🔴 Tansyon Wo Anpil',bg:'rgba(192,57,43,.08)'  }
  if (sys>=140||dia>=100) return { color:'#E07B2A', label:'🟠 Tansyon Limit',   bg:'rgba(224,123,42,.08)' }
  if (sys>=130||dia>=90)  return { color:'#E0A82A', label:'🟡 Yon ti jan wo',   bg:'rgba(224,168,42,.08)' }
  if (sys>=100&&dia>=65)  return { color:'#1A8A4A', label:'✓ Nòmal',            bg:'rgba(26,138,74,.08)'  }
  if (sys>=90 ||dia>=60)  return { color:'#3AA876', label:'🔵 Ba Nòmal',         bg:'rgba(58,168,118,.08)' }
  return                          { color:'#C0392B', label:'🔴 Ipotansyon',       bg:'rgba(192,57,43,.08)'  }
}

/* ── DATA TYPES ── */
interface UserData {
  first_name: string | null
  role: string
}
interface LatestReading {
  ta_sys: number | null
  ta_dia: number | null
  glycemie: number | null
  recorded_at: string
}
interface Tip {
  content_ht: string
  icon: string
  category: string
}

export default function CareHome() {
  const router    = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMolCanvas(canvasRef)

  // ── State
  const [userData,     setUserData]     = useState<UserData | null>(null)
  const [latestReading,setLatestReading]= useState<LatestReading | null>(null)
  const [tip,          setTip]          = useState<Tip | null>(null)
  const [streak,       setStreak]       = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [today,        setToday]        = useState('')

  // ── Bouton urgence
  const [urgenceStep,  setUrgenceStep]  = useState<'idle'|'confirm'|'sending'|'sent'>('idle')
  const [urgenceError, setUrgenceError] = useState('')

  useEffect(() => {
    // Today's date in Creole
    const d = new Date()
    const days   = ['Dimanch','Lendi','Madi','Mèkredi','Jedi','Vandredi','Samdi']
    const months = ['janvye','fevriye','mas','avril','me','jen','jiyè','out','septanm','oktòb','novanm','desanm']
    setToday(`${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`)

    loadData()
  }, [])

  async function loadData() {
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/care/login'); return }

      // 2. Fetch user info
      const { data: uData } = await supabase
        .from('users')
        .select('first_name, role')
        .eq('id', user.id)
        .maybeSingle()

      if (uData) setUserData(uData)

      // 3. Fetch latest reading from vital_signs_readings
      const { data: readings } = await supabase
        .from('vital_signs_readings')
        .select('ta_sys, ta_dia, glycemie, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)

      if (readings && readings.length > 0) {
        setLatestReading(readings[0])
      }

      // 4. Calculate streak (days with at least one reading)
      const { data: allReadings } = await supabase
        .from('vital_signs_readings')
        .select('recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      if (allReadings && allReadings.length > 0) {
        let streakCount = 0
        const today = new Date(); today.setHours(0,0,0,0)
        const dates = new Set(allReadings.map(r => {
          const d = new Date(r.recorded_at); d.setHours(0,0,0,0); return d.getTime()
        }))
        let checkDate = today.getTime()
        while (dates.has(checkDate)) {
          streakCount++
          checkDate -= 86400000 // -1 day
        }
        setStreak(streakCount)
      }

      // 5. Fetch Konsèy jounen an — rotate daily
      const { data: tips } = await supabase
        .from('care_tips')
        .select('content_ht, icon, category')
        .eq('active', true)

      if (tips && tips.length > 0) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0).getTime()) / 86400000)
        setTip(tips[dayOfYear % tips.length])
      }

    } catch (err) {
      console.error('loadData error:', err)
    } finally {
      setLoading(false)
    }
  }

  const taStatus = latestReading?.ta_sys && latestReading?.ta_dia
    ? getTaStatus(latestReading.ta_sys, latestReading.ta_dia)
    : null

  const firstName = userData?.first_name || 'Ou'

  const lastEntryTime = latestReading?.recorded_at
    ? (() => {
        const d = new Date(latestReading.recorded_at)
        const now = new Date()
        const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000)
        if (diffH < 1) return 'Jodi a'
        if (diffH < 24) return `${diffH}h de sa`
        const days = Math.floor(diffH / 24)
        return `${days} jou de sa`
      })()
    : null

  /* ── BOUTON URGENCE ── */
  async function handleUrgence() {
    setUrgenceStep('sending')
    setUrgenceError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setUrgenceStep('idle'); return }

      // 1. Récupérer la localisation GPS
      let locationText = 'Pozisyon pa disponib'
      let lat: number | null = null
      let lng: number | null = null

      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        )
        lat = pos.coords.latitude
        lng = pos.coords.longitude
        locationText = `https://maps.google.com/?q=${lat},${lng}`
      } catch {
        locationText = 'Pozisyon pa disponib'
      }

      // 2. Construire le message d'urgence
      const taText = latestReading?.ta_sys && latestReading?.ta_dia
        ? `Tansyon dènye: ${latestReading.ta_sys}/${latestReading.ta_dia} mmHg`
        : ''
      const message = encodeURIComponent(
        `🚨 IJAN — ${firstName} bezwen èd kounye a!\n\n` +
        `${taText}\n` +
        `📍 Pozisyon: ${locationText}\n\n` +
        `Voye pa OxyGen Care`
      )

      // 3. Fetch proches from care_family
      const { data: proches } = await supabase
        .from('care_family')
        .select('proche_phone, proche_name')
        .eq('patient_id', user.id)
        .eq('active', true)

      // 4. Log l'alerte dans Supabase
      await supabase.from('care_alerts').insert({
        user_id:    user.id,
        alert_type: 'emergency_button',
        latitude:   lat,
        longitude:  lng,
        created_at: new Date().toISOString(),
      })

      // 5. Ouvrir WhatsApp pour le premier proche
      if (proches && proches.length > 0) {
        const phone = proches[0].proche_phone?.replace(/\D/g, '')
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
      } else {
        // Pas de proche — ouvrir WhatsApp sans numéro
        window.open(`https://wa.me/?text=${message}`, '_blank')
      }

      setUrgenceStep('sent')
      setTimeout(() => setUrgenceStep('idle'), 5000)

    } catch (err) {
      console.error('urgence error:', err)
      setUrgenceError('Erè — eseye ankò')
      setUrgenceStep('idle')
    }
  }

  const TAB_BAR = [
    { label:'Akèy',       href:'/care/home',    active:true,  icon:<IconHome    size={22} color={TEAL}/> },
    { label:'Antre chif', href:'/care/entry',   active:false, icon:<IconEntry   size={22} color="#6B7A90"/> },
    { label:'Istorik',    href:'/care/history', active:false, icon:<IconHistory size={22} color="#6B7A90"/> },
    { label:'Fanmi',      href:'/care/family',  active:false, icon:<IconFamily  size={22} color="#6B7A90"/> },
    { label:'Premium',    href:'/care/premium', active:false, icon:<IconPremium size={22}/> },
  ]

  return (
    <div style={{minHeight:'100vh',background:'#F0F4F9',fontFamily:'DM Sans, sans-serif',paddingBottom:'100px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06);filter:drop-shadow(0 0 10px rgba(212,168,67,.4))}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .c1{animation:fadeUp .5s ease .05s forwards;opacity:0}
        .c2{animation:fadeUp .5s ease .12s forwards;opacity:0}
        .c3{animation:fadeUp .5s ease .19s forwards;opacity:0}
        .c4{animation:fadeUp .5s ease .26s forwards;opacity:0}
        .qa-card{transition:transform .15s}.qa-card:active{transform:scale(.97)}
        .sk{animation:pulse 1.5s ease-in-out infinite;background:rgba(27,42,74,.08);border-radius:8px}
        @media(prefers-reduced-motion:reduce){.c1,.c2,.c3,.c4,.sk{animation:none;opacity:1}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:'linear-gradient(150deg,#065C50 0%,#0A7A6A 100%)',borderRadius:'0 0 28px 28px',padding:'52px 22px 22px',position:'relative',overflow:'hidden',marginBottom:'16px'}}>
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(150deg,rgba(6,92,80,.7),rgba(10,122,106,.6))',zIndex:1,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2}}>
          {/* Name + date */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'20px'}}>
            <div>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'11px',color:'rgba(255,255,255,.5)',letterSpacing:'.5px',marginBottom:'3px'}}>
                Oxy<span style={{color:GOLD}}>Gen</span> Care
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.5)',marginBottom:'1px'}}>Bonjou,</div>
              {loading ? (
                <div className="sk" style={{width:'140px',height:'26px'}}/>
              ) : (
                <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'24px',fontWeight:500,color:'white',lineHeight:1}}>{firstName}</div>
              )}
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginTop:'3px',textTransform:'capitalize'}}>{today}</div>
            </div>
            {/* Streak */}
            <div style={{background:'rgba(212,168,67,.15)',border:'1px solid rgba(212,168,67,.3)',borderRadius:'14px',padding:'10px 14px',textAlign:'center'}}>
              <div style={{fontFamily:'DM Mono, monospace',fontSize:'22px',fontWeight:700,color:GOLD,lineHeight:1}}>{loading?'…':streak}</div>
              <div style={{fontSize:'9px',fontWeight:700,color:'rgba(212,168,67,.7)',textTransform:'uppercase',letterSpacing:'.5px',marginTop:'2px'}}>
                {streak > 1 ? '🔥 jou' : 'jou'}
              </div>
            </div>
          </div>

          {/* TA card in header */}
          {loading ? (
            <div className="sk" style={{height:'64px',borderRadius:'16px'}}/>
          ) : latestReading?.ta_sys && latestReading?.ta_dia && taStatus ? (
            <div style={{background:taStatus.bg,border:`1px solid ${taStatus.color}30`,borderRadius:'16px',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px'}}>Dènye Tansyon</div>
                <div style={{fontFamily:'DM Mono, monospace',fontSize:'28px',fontWeight:700,color:'white',lineHeight:1}}>
                  {latestReading.ta_sys}/{latestReading.ta_dia}
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,.5)',fontWeight:400,marginLeft:'6px'}}>mmHg</span>
                </div>
                <div style={{fontSize:'11px',fontWeight:700,color:taStatus.color,marginTop:'3px'}}>{taStatus.label}</div>
              </div>
              {lastEntryTime && (
                <div style={{fontSize:'10px',color:'rgba(255,255,255,.4)',textAlign:'right'}}>
                  <div>{lastEntryTime}</div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/care/entry" style={{textDecoration:'none'}}>
              <div style={{background:'rgba(255,255,255,.1)',border:'1.5px dashed rgba(255,255,255,.25)',borderRadius:'16px',padding:'14px 16px',textAlign:'center'}}>
                <div style={{fontSize:'13px',fontWeight:600,color:'rgba(255,255,255,.7)',marginBottom:'3px'}}>Pa gen chif ankò jodi a</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)'}}>Tape pou antre premye chif ou → </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div style={{padding:'0 16px'}}>

        {/* ── QUICK ACTIONS ── */}
        <div className="c1" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}}>
          <Link href="/care/entry" style={{textDecoration:'none'}}>
            <div className="qa-card" style={{background:'white',borderRadius:'18px',padding:'16px',border:'1px solid rgba(27,42,74,.07)',boxShadow:'0 1px 4px rgba(0,0,0,.04)',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(10,122,106,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <IconEntry size={22} color={TEAL}/>
              </div>
              <div>
                <div style={{fontSize:'13px',fontWeight:700,color:NAVY}}>Antre chif</div>
                <div style={{fontSize:'10px',color:'#6B7A90',marginTop:'1px'}}>Tansyon · Sik · Labo</div>
              </div>
            </div>
          </Link>
          <Link href="/care/history" style={{textDecoration:'none'}}>
            <div className="qa-card" style={{background:'white',borderRadius:'18px',padding:'16px',border:'1px solid rgba(27,42,74,.07)',boxShadow:'0 1px 4px rgba(0,0,0,.04)',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(212,168,67,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <IconHistory size={22} color="#8C6B00"/>
              </div>
              <div>
                <div style={{fontSize:'13px',fontWeight:700,color:NAVY}}>Istorik</div>
                <div style={{fontSize:'10px',color:'#6B7A90',marginTop:'1px'}}>Graf · Tendans</div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── GLYCÉMIE card ── */}
        {!loading && latestReading?.glycemie && (
          <div className="c2" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'14px 16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)',display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'rgba(10,122,106,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'22px'}}>🩸</div>
            <div style={{flex:1}}>
              <div style={{fontSize:'10px',fontWeight:700,color:'#6B7A90',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'2px'}}>Dènye Glisemi</div>
              <div style={{display:'flex',alignItems:'baseline',gap:'6px'}}>
                <span style={{fontFamily:'DM Mono, monospace',fontSize:'24px',fontWeight:700,color:NAVY}}>{latestReading.glycemie}</span>
                <span style={{fontSize:'11px',color:'#6B7A90'}}>mg/dL</span>
              </div>
            </div>
            <div style={{fontSize:'11px',color:'#6B7A90'}}>{lastEntryTime}</div>
          </div>
        )}

        {/* ── KONSÈY JOUNEN AN ── */}
        {!loading && tip && (
          <div className="c2" style={{background:`linear-gradient(135deg,${NAVY} 0%,#2D4A6B 100%)`,borderRadius:'18px',padding:'16px',marginBottom:'12px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-20px',right:'-20px',fontSize:'80px',opacity:.06}}>{tip.icon}</div>
            <div style={{fontSize:'10px',fontWeight:700,color:GOLD,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'8px'}}>
              💡 Konsèy jounen an
            </div>
            <div style={{fontSize:'14px',color:'rgba(255,255,255,.9)',lineHeight:1.6,fontWeight:400}}>
              {tip.icon} {tip.content_ht}
            </div>
          </div>
        )}

        {/* Empty state — no readings yet */}
        {!loading && !latestReading && (
          <div className="c2" style={{background:'white',borderRadius:'18px',border:'1.5px dashed rgba(27,42,74,.15)',padding:'24px',textAlign:'center',marginBottom:'12px'}}>
            <div style={{fontSize:'36px',marginBottom:'10px'}}>📊</div>
            <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:500,color:NAVY,marginBottom:'6px'}}>Kòmanse swiv sante ou</div>
            <div style={{fontSize:'13px',color:'#6B7A90',lineHeight:1.6,marginBottom:'16px'}}>Antre premye chif tansyon ou pou wè analiz ou yo aparèt isit.</div>
            <Link href="/care/entry" style={{textDecoration:'none'}}>
              <div style={{background:TEAL,color:'white',borderRadius:'12px',padding:'12px 24px',fontSize:'13px',fontWeight:700,display:'inline-block'}}>
                Antre premye chif yo →
              </div>
            </Link>
          </div>
        )}

        {/* ── FAMILY ALERT ── */}
        <div className="c3" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,.07)',padding:'14px 16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <IconFamily size={22} color={TEAL}/>
              <div>
                <div style={{fontSize:'13px',fontWeight:700,color:NAVY}}>Espas Fanmi</div>
                <div style={{fontSize:'10px',color:'#6B7A90',marginTop:'1px'}}>Konekte ak pwòch ou yo</div>
              </div>
            </div>
            <Link href="/care/family" style={{background:'rgba(10,122,106,.08)',border:'1px solid rgba(10,122,106,.15)',borderRadius:'20px',padding:'5px 12px',fontSize:'11px',fontWeight:700,color:TEAL,textDecoration:'none'}}>
              Wè →
            </Link>
          </div>
        </div>

        {/* ── BOUTON URGENCE ── */}
        <div style={{marginBottom:'12px'}}>
          {urgenceStep === 'idle' && (
            <button onClick={()=>setUrgenceStep('confirm')} style={{width:'100%',background:'linear-gradient(135deg,#7B0D1E 0%,#C0392B 100%)',color:'white',border:'none',borderRadius:'18px',padding:'18px',fontSize:'16px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',boxShadow:'0 6px 20px rgba(192,57,43,.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
              <span style={{fontSize:'22px'}}>🆘</span> Bouton Ijans
            </button>
          )}

          {urgenceStep === 'confirm' && (
            <div style={{background:'white',borderRadius:'18px',border:'2px solid #C0392B',padding:'18px',boxShadow:'0 4px 16px rgba(192,57,43,.2)'}}>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:500,color:'#C0392B',marginBottom:'6px',textAlign:'center'}}>Ou sèten ou bezwen èd ?</div>
              <div style={{fontSize:'12px',color:'#6B7A90',textAlign:'center',marginBottom:'16px',lineHeight:1.6}}>Aksyon sa ap voye yon mesaj WhatsApp bay pwòch ou yo ak pozisyon ou.</div>
              <div style={{display:'flex',gap:'10px'}}>
                <button onClick={()=>setUrgenceStep('idle')} style={{flex:1,background:'rgba(27,42,74,.06)',color:NAVY,border:'1px solid rgba(27,42,74,.15)',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>
                  Anile
                </button>
                <button onClick={handleUrgence} style={{flex:2,background:'#C0392B',color:'white',border:'none',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'DM Sans, sans-serif',boxShadow:'0 4px 12px rgba(192,57,43,.3)'}}>
                  🆘 Wi — Voye alèt
                </button>
              </div>
            </div>
          )}

          {urgenceStep === 'sending' && (
            <div style={{background:'rgba(192,57,43,.08)',border:'1px solid rgba(192,57,43,.2)',borderRadius:'18px',padding:'18px',textAlign:'center'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>📡</div>
              <div style={{fontSize:'14px',fontWeight:600,color:'#C0392B'}}>N ap voye alèt la...</div>
            </div>
          )}

          {urgenceStep === 'sent' && (
            <div style={{background:'rgba(26,138,74,.08)',border:'1px solid rgba(26,138,74,.2)',borderRadius:'18px',padding:'18px',textAlign:'center'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>✅</div>
              <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'18px',fontWeight:500,color:'#1A8A4A',marginBottom:'4px'}}>Alèt voye !</div>
              <div style={{fontSize:'12px',color:'#6B7A90'}}>Pwòch ou yo resevwa yon mesaj WhatsApp</div>
            </div>
          )}

          {urgenceError && (
            <div style={{fontSize:'12px',color:'#C0392B',textAlign:'center',marginTop:'8px'}}>{urgenceError}</div>
          )}
        </div>
        <div className="c4" style={{background:`linear-gradient(135deg,#8C6B00 0%,${GOLD} 100%)`,borderRadius:'18px',padding:'16px',boxShadow:'0 4px 16px rgba(212,168,67,.3)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <IconPremium size={32}/>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:700,color:'white',marginBottom:'2px'}}>OxyGen Care Premium</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.7)'}}>Bouton ijans · Rapò PDF · Rappèl labo</div>
            </div>
            <Link href="/care/premium" style={{background:'white',color:'#8C6B00',borderRadius:'20px',padding:'6px 14px',fontSize:'11px',fontWeight:700,textDecoration:'none'}}>
              Wè →
            </Link>
          </div>
        </div>

      </div>

      {/* ── TAB BAR ── */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'white',borderTop:'1px solid rgba(27,42,74,.08)',display:'flex',padding:'10px 0 24px',zIndex:50,boxShadow:'0 -4px 20px rgba(0,0,0,.06)'}}>
        {TAB_BAR.map(t=>(
          <Link key={t.label} href={t.href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',textDecoration:'none'}}>
            <div style={{width:'48px',height:'28px',borderRadius:'14px',background:t.active?'rgba(10,122,106,.1)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {t.icon}
            </div>
            <div style={{fontSize:'10px',fontWeight:t.active?700:500,color:t.active?TEAL:'#6B7A90',letterSpacing:'.2px'}}>{t.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}