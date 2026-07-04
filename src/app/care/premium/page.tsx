'use client'

import Grain from '@/components/Grain'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Smartphone, FileText, Users, TrendingUp, Target, Dna, Star, Gift, Globe, Check, CircleCheck } from 'lucide-react'

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
    function init(){nodes=[];const c=Math.min(14,Math.floor(W*H/8000));for(let i=0;i<c;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.8+1})}
    function tick(){
      ctx!.clearRect(0,0,W,H);const MAX=110
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);if(d<MAX){ctx!.strokeStyle=`rgba(255,255,255,${(1-d/MAX)*.15})`;ctx!.lineWidth=0.8;ctx!.beginPath();ctx!.moveTo(nodes[i].x,nodes[i].y);ctx!.lineTo(nodes[j].x,nodes[j].y);ctx!.stroke()}}
      nodes.forEach(n=>{ctx!.fillStyle='rgba(255,255,255,0.15)';ctx!.beginPath();ctx!.arc(n.x,n.y,n.r,0,Math.PI*2);ctx!.fill();n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1})
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

type Plan    = 'haiti' | 'diaspora'
type Payment = 'moncash' | 'natcash' | 'card' | 'zelle' | 'cashapp'

const FEATURES = [
  { Icon: Smartphone, label:'Alèt WhatsApp + SMS an tan reyèl' },
  { Icon: FileText,   label:'Rapò PDF pou doktè ou' },
  { Icon: Users,      label:'Espas fanmi + diaspora' },
  { Icon: TrendingUp, label:'Istorik 12 mwa' },
  { Icon: Target,     label:'Sèy alèt pèsonalize' },
  { Icon: Dna,        label:'HbA1c estimé otomatik' },
]

export default function CarePremium() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMolCanvas(canvasRef)

  const [plan,    setPlan]    = useState<Plan>('haiti')
  const [payment, setPayment] = useState<Payment>('moncash')
  const [paying,  setPaying]  = useState(false)
  const [paid,    setPaid]    = useState(false)

  // Trial info
  const trialDaysLeft = 23
  const trialActive   = trialDaysLeft > 0

  async function handlePay() {
    setPaying(true)
    await new Promise(r=>setTimeout(r,1500))
    setPaying(false); setPaid(true)
  }

  const paymentMethods: { key:Payment; name:string; sub:string; flag?:string }[] = plan==='haiti'
    ? [
        { key:'moncash', name:'MonCash',  sub:'HTG · Imedyatman', flag:'🇭🇹' },
        { key:'natcash', name:'Natcash',  sub:'HTG · Imedyatman', flag:'🇭🇹' },
      ]
    : [
        { key:'card',    name:'Kat Kredi', sub:'USD · Visa / Mastercard' },
        { key:'zelle',   name:'Zelle',     sub:'USD · Imedyatman',       flag:'🇺🇸' },
        { key:'cashapp', name:'CashApp',   sub:'USD · Imedyatman',       flag:'🇺🇸' },
      ]

  const priceLabel = plan==='haiti' ? '2 000 HTG' : '25 USD'
  const payLabel   = payment==='moncash' ? 'MonCash' : payment==='natcash' ? 'Natcash' : payment==='card' ? 'Kat Kredi' : payment==='zelle' ? 'Zelle' : 'CashApp'

  return (
    <div style={{minHeight:'100vh',background:'radial-gradient(115% 78% at 50% -8%,#D6EBCE 0%,#E6F1DC 50%,#DBEBD1 100%)',fontFamily:'var(--font-manrope), Manrope, sans-serif',paddingBottom:'100px'}}>
      <Grain/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .c1{animation:fadeUp .5s ease .05s forwards;opacity:0}
        .c2{animation:fadeUp .5s ease .12s forwards;opacity:0}
        .c3{animation:fadeUp .5s ease .19s forwards;opacity:0}
        .c4{animation:fadeUp .5s ease .26s forwards;opacity:0}
        .tb{transition:all .15s;cursor:pointer}
        .tb:active{opacity:.8}
        .pay-btn{transition:all .15s}
        .pay-btn:active{transform:scale(0.98)}
        .shimmer-btn{
          background:linear-gradient(90deg,#1A8A4A 0%,#25D37A 50%,#1A8A4A 100%);
          background-size:200% auto;
          animation:shimmer 2s linear infinite;
        }
        @media(prefers-reduced-motion:reduce){.c1,.c2,.c3,.c4{animation:none;opacity:1}.shimmer-btn{animation:none}}
      `}</style>

      {/* ── HEADER — gold gradient ── */}
      <div style={{background:'linear-gradient(150deg,#8C6B00 0%,#C49A20 50%,#D4A843 100%)',borderRadius:'0 0 24px 24px',padding:'52px 20px 22px',marginBottom:'14px',position:'relative',overflow:'hidden'}}>
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(150deg,rgba(140,107,0,0.5) 0%,rgba(212,168,67,0.3) 100%)',zIndex:1,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
            <Link href="/care/home" style={{width:'32px',height:'32px',borderRadius:'10px',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
              <svg width="8" height="13" viewBox="0 0 8 13" fill="none"><path d="M7 1L1 6.5L7 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </Link>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.7)',letterSpacing:'0.3px',marginBottom:'4px'}}>Oxy<span style={{color:'white'}}>Gen</span> Care</div>
              <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'27px',fontWeight:800,letterSpacing:'-0.5px',color:'white',lineHeight:1.05}}>Premium</div>
            </div>
            {/* Premium badge */}
            <div style={{background:'rgba(255,255,255,0.2)',borderRadius:'20px',padding:'5px 12px',border:'1px solid rgba(255,255,255,0.3)'}}>
              <div style={{fontFamily:'DM Mono, monospace',fontSize:'11px',fontWeight:700,color:'white',letterSpacing:'0.5px',display:'flex',alignItems:'center',gap:'4px'}}><Star size={12} color="white"/> PREMIUM</div>
            </div>
          </div>

          {/* Trial banner */}
          {trialActive && (
            <div style={{background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',borderRadius:'14px',padding:'12px 16px',border:'1px solid rgba(255,255,255,0.2)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:'12px',fontWeight:700,color:'white',marginBottom:'2px',display:'flex',alignItems:'center',gap:'5px'}}><Gift size={14} color="white"/> Essai gratis ou — {trialDaysLeft} jou ki rete</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.7)'}}>Tout fonksyonalite Premium aktive</div>
                </div>
                {/* Progress bar */}
                <div style={{width:'48px',height:'48px',position:'relative',flexShrink:0}}>
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4"/>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="4"
                      strokeDasharray={`${(trialDaysLeft/30)*125.6} 125.6`}
                      strokeLinecap="round" transform="rotate(-90 24 24)"/>
                  </svg>
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Mono, monospace',fontSize:'11px',fontWeight:700,color:'white'}}>{trialDaysLeft}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{padding:'0 16px'}}>

        {/* ── PLAN SELECTOR ── */}
        <div className="c1" style={{marginBottom:'12px'}}>
          <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'8px',paddingLeft:'2px'}}>Chwazi plan ou</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>

            {/* Haiti plan */}
            <div className="tb" onClick={()=>{setPlan('haiti');setPayment('moncash')}}
              style={{background:'white',borderRadius:'18px',border:`2px solid ${plan==='haiti'?TEAL:'rgba(27,42,74,0.1)'}`,padding:'16px',cursor:'pointer',boxShadow:plan==='haiti'?'0 0 0 3px rgba(10,122,106,0.1)':'none',transition:'all .2s',position:'relative',overflow:'hidden'}}>
              {plan==='haiti'&&<div style={{position:'absolute',top:0,right:0,background:TEAL,color:'white',fontSize:'9px',fontWeight:700,padding:'4px 10px',borderRadius:'0 16px 0 10px',letterSpacing:'0.5px'}}>CHWAZI</div>}
              <div style={{marginBottom:'10px'}}>
                <div style={{fontSize:'11px',fontWeight:700,color:'#6B7A90',marginBottom:'4px'}}>🇭🇹 Ayiti</div>
                <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'28px',fontWeight:700,color:plan==='haiti'?TEAL:NAVY,lineHeight:1}}>2 000</div>
                <div style={{fontSize:'11px',color:'#6B7A90',fontWeight:500,marginTop:'2px'}}>HTG / 6 mwa</div>
              </div>
              <div style={{fontSize:'11px',color:'#6B7A90',lineHeight:1.5}}>MonCash · Natcash</div>
            </div>

            {/* Diaspora plan */}
            <div className="tb" onClick={()=>{setPlan('diaspora');setPayment('zelle')}}
              style={{background:'white',borderRadius:'18px',border:`2px solid ${plan==='diaspora'?GOLD:'rgba(27,42,74,0.1)'}`,padding:'16px',cursor:'pointer',boxShadow:plan==='diaspora'?'0 0 0 3px rgba(212,168,67,0.15)':'none',transition:'all .2s',position:'relative',overflow:'hidden'}}>
              {plan==='diaspora'&&<div style={{position:'absolute',top:0,right:0,background:GOLD,color:'white',fontSize:'9px',fontWeight:700,padding:'4px 10px',borderRadius:'0 16px 0 10px',letterSpacing:'0.5px'}}>CHWAZI</div>}
              <div style={{marginBottom:'10px'}}>
                <div style={{fontSize:'11px',fontWeight:700,color:'#6B7A90',marginBottom:'4px',display:'flex',alignItems:'center',gap:'4px'}}><Globe size={12} color="#6B7A90"/> Diaspora — Kado</div>
                <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'28px',fontWeight:700,color:plan==='diaspora'?GOLD:NAVY,lineHeight:1}}>25</div>
                <div style={{fontSize:'11px',color:'#6B7A90',fontWeight:500,marginTop:'2px'}}>USD / an</div>
              </div>
              <div style={{fontSize:'11px',color:'#6B7A90',lineHeight:1.5}}>Ofri pou yon pwòch an Ayiti</div>
            </div>
          </div>

          {/* Diaspora note */}
          {plan==='diaspora'&&(
            <div style={{background:'rgba(212,168,67,0.08)',border:'1px solid rgba(212,168,67,0.2)',borderRadius:'12px',padding:'10px 14px',marginTop:'10px',fontSize:'12px',color:'#8C6B00',lineHeight:1.6,display:'flex',alignItems:'flex-start',gap:'6px'}}>
              <Gift size={14} color="#8C6B00" style={{flexShrink:0,marginTop:'2px'}}/>
              <span>Ou peye yon fwa — yon manm fanmi ou an Ayiti jwenn 1 an Premium gratis. Rapò otomatik chak dimanch pa WhatsApp.</span>
            </div>
          )}
        </div>

        {/* ── FEATURES ── */}
        <div className="c2" style={{background:'white',borderRadius:'18px',border:'1px solid rgba(27,42,74,0.07)',padding:'16px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'12px'}}>Sa ki gen ladan</div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {FEATURES.map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'rgba(10,122,106,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><f.Icon size={16} color={TEAL}/></div>
                <div style={{fontSize:'13px',fontWeight:500,color:NAVY,flex:1}}>{f.label}</div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="rgba(26,138,74,0.1)"/><path d="M5 8L7 10L11 6" stroke="#1A8A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAYMENT METHOD ── */}
        <div className="c3" style={{marginBottom:'12px'}}>
          <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1.5px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'8px',paddingLeft:'2px'}}>Metòd peman</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {paymentMethods.map(m=>(
              <button key={m.key} className="pay-btn" onClick={()=>setPayment(m.key)} style={{background:'white',border:`2px solid ${payment===m.key?(plan==='diaspora'?GOLD:TEAL):'rgba(27,42,74,0.1)'}`,borderRadius:'14px',padding:'12px',cursor:'pointer',textAlign:'left',fontFamily:'var(--font-manrope), Manrope, sans-serif',boxShadow:payment===m.key?`0 0 0 3px ${plan==='diaspora'?'rgba(212,168,67,0.12)':'rgba(10,122,106,0.1)'}`:'none',transition:'all .15s',display:'flex',alignItems:'center',gap:'8px'}}>
                {m.flag&&<span style={{fontSize:'18px'}}>{m.flag}</span>}
                <div>
                  <div style={{fontSize:'13px',fontWeight:700,color:payment===m.key?(plan==='diaspora'?GOLD:TEAL):NAVY}}>{m.name}</div>
                  <div style={{fontSize:'10px',color:'#6B7A90',marginTop:'1px'}}>{m.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── RENEWAL INFO ── */}
        <div className="c3" style={{background:'rgba(27,42,74,0.03)',borderRadius:'14px',padding:'12px 16px',marginBottom:'16px',border:'1px solid rgba(27,42,74,0.07)'}}>
          <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'1px',color:'#6B7A90',textTransform:'uppercase',marginBottom:'8px'}}>Renouvèlman</div>
          <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
            {['J-14 · J-7 · J-1 : nou raple ou pa WhatsApp','Ou ka renouvle nenpòt lè','Done ou yo pa janm efase — menm si ou pa peye'].map((t,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'12px',color:'#374151'}}>
                <Check size={14} color={TEAL} style={{flexShrink:0,marginTop:'2px'}}/>{t}
              </div>
            ))}
          </div>
        </div>

        {/* ── PAY BUTTON ── */}
        {paid ? (
          <div className="c4" style={{background:'#1A8A4A',borderRadius:'16px',padding:'18px',textAlign:'center'}}>
            <div style={{marginBottom:'6px'}}><CircleCheck size={24} color={TEAL}/></div>
            <div style={{fontFamily:'var(--font-manrope), Manrope, sans-serif',fontSize:'20px',fontWeight:700,color:'white',marginBottom:'4px'}}>Peman konfime !</div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)'}}>OxyGen Care Premium aktive pou 6 mwa</div>
          </div>
        ) : (
          <div className="c4">
            <button onClick={handlePay} disabled={paying} className={paying?'shimmer-btn':''} style={{width:'100%',background:paying?undefined:(plan==='diaspora'?GOLD:TEAL),color:'white',border:'none',borderRadius:'16px',padding:'17px',fontSize:'15px',fontWeight:700,cursor:paying?'not-allowed':'pointer',fontFamily:'var(--font-manrope), Manrope, sans-serif',boxShadow:`0 6px 20px ${plan==='diaspora'?'rgba(212,168,67,0.35)':'rgba(10,122,106,0.35)'}`,transition:'opacity .2s',marginBottom:'10px'}}>
              {paying?'N ap konfime peman...':`Peye ${priceLabel} via ${payLabel}`}
            </button>
            <Link href="/care/home" style={{display:'block',width:'100%',background:'rgba(27,42,74,0.05)',color:'#6B7A90',border:'1px solid rgba(27,42,74,0.1)',borderRadius:'14px',padding:'14px',fontSize:'13px',fontWeight:500,textDecoration:'none',textAlign:'center',fontFamily:'var(--font-manrope), Manrope, sans-serif'}}>
              Kontinye gratis — {trialDaysLeft} jou ki rete
            </Link>
          </div>
        )}
      </div>

      {/* ── TAB BAR ── */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'white',borderTop:'1px solid rgba(27,42,74,0.08)',display:'flex',padding:'10px 0 24px',zIndex:50,boxShadow:'0 -4px 20px rgba(0,0,0,0.06)'}}>
        {[
          { label:'Akèy',       href:'/care/home',    active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5" fill="#6B7A90"/><circle cx="10" cy="10" r="3.5" fill="#6B7A90"/><circle cx="38" cy="10" r="3.5" fill="#6B7A90"/><circle cx="10" cy="38" r="3.5" fill="#6B7A90"/><circle cx="38" cy="38" r="3.5" fill="#6B7A90"/><line x1="13" y1="13" x2="20" y2="20" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="35" y1="13" x2="28" y2="20" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="13" y1="35" x2="20" y2="28" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="35" y1="35" x2="28" y2="28" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="24" cy="7" r="3" fill="rgba(107,122,144,0.5)"/></svg> },
          { label:'Antre chif', href:'/care/entry',   active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5" fill="#6B7A90"/><circle cx="8" cy="16" r="3.5" fill="#6B7A90"/><circle cx="8" cy="24" r="3.5" fill="#6B7A90"/><circle cx="8" cy="32" r="3.5" fill="#6B7A90"/><line x1="11.5" y1="16" x2="19" y2="21" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="11.5" y1="24" x2="19" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="11.5" y1="32" x2="19" y2="27" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="29" y1="24" x2="40" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="2" strokeLinecap="round"/><path d="M35 19 L40 24 L35 29" stroke="rgba(107,122,144,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> },
          { label:'Istorik',    href:'/care/history', active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="8" cy="38" r="3.5" fill="#6B7A90"/><circle cx="17" cy="30" r="3.5" fill="#6B7A90"/><circle cx="26" cy="22" r="3.5" fill="#6B7A90"/><circle cx="35" cy="14" r="3.5" fill="#6B7A90"/><line x1="11" y1="36" x2="14" y2="32" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="28" x2="23" y2="24" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="29" y1="20" x2="32" y2="16" stroke="rgba(107,122,144,0.5)" strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="42" x2="43" y2="42" stroke="rgba(107,122,144,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg> },
          { label:'Fanmi',      href:'/care/family',  active:false, icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="26" r="7" fill="#6B7A90"/><circle cx="10" cy="18" r="5" fill="#6B7A90" opacity={0.6}/><circle cx="38" cy="18" r="5" fill="#6B7A90" opacity={0.6}/><circle cx="24" cy="8" r="3.5" fill="#6B7A90" opacity={0.4}/><line x1="14.5" y1="20" x2="18" y2="22" stroke="rgba(107,122,144,0.4)" strokeWidth="1.5" strokeLinecap="round"/><line x1="33.5" y1="20" x2="30" y2="22" stroke="rgba(107,122,144,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg> },
          { label:'Premium',    href:'/care/premium', active:true,  icon:<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="5.5" fill={GOLD}/><circle cx="24" cy="7" r="3.5" fill={GOLD} opacity={0.9}/><circle cx="38" cy="15" r="3" fill={NAVY} opacity={0.7}/><circle cx="38" cy="33" r="3" fill={NAVY} opacity={0.7}/><circle cx="24" cy="41" r="3.5" fill={GOLD} opacity={0.9}/><circle cx="10" cy="33" r="3" fill={NAVY} opacity={0.7}/><circle cx="10" cy="15" r="3" fill={NAVY} opacity={0.7}/><line x1="24" y1="10.5" x2="24" y2="18.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="35.4" y1="16.7" x2="29" y2="20.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/><line x1="35.4" y1="31.3" x2="29" y2="27.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/><line x1="24" y1="37.5" x2="24" y2="29.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="12.6" y1="31.3" x2="19" y2="27.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/><line x1="12.6" y1="16.7" x2="19" y2="20.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/></svg> },
        ].map(t=>(
          <Link key={t.label} href={t.href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',textDecoration:'none'}}>
            <div style={{width:'48px',height:'28px',borderRadius:'14px',background:t.active?'rgba(212,168,67,0.12)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {t.icon}
            </div>
            <div style={{fontSize:'10px',fontWeight:t.active?700:500,color:t.active?GOLD:'#6B7A90',letterSpacing:'0.2px'}}>{t.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}