'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function CareLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    let raf: number
    let W = 0, H = 0

    function resize() {
      W = cvs!.width  = cvs!.offsetWidth
      H = cvs!.height = cvs!.offsetHeight
    }
    function init() {
      nodes = []
      const count = Math.min(28, Math.floor(W * H / 14000))
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 2 + 1.2
        })
      }
    }
    function tick() {
      ctx!.clearRect(0, 0, W, H)
      const MAX = 140
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d  = Math.hypot(dx, dy)
          if (d < MAX) {
            ctx!.strokeStyle = `rgba(212,168,67,${(1 - d / MAX) * 0.25})`
            ctx!.lineWidth = 0.8
            ctx!.beginPath()
            ctx!.moveTo(nodes[i].x, nodes[i].y)
            ctx!.lineTo(nodes[j].x, nodes[j].y)
            ctx!.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx!.fillStyle = 'rgba(255,255,255,0.18)'
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx!.fill()
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })
      raf = requestAnimationFrame(tick)
    }

    resize(); init()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) tick()

    const handleResize = () => { resize(); init() }
    window.addEventListener('resize', handleResize, { passive: true })
    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else if (!reduced) tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #065C50 0%, #0A7A6A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      color: 'white',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;700&display=swap');

        @keyframes breathe {
          0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 0px  rgba(212,168,67,0)); }
          50%       { transform: scale(1.07); filter: drop-shadow(0 0 18px rgba(212,168,67,0.5)); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bohr-anim { animation: breathe 4.5s ease-in-out infinite; }
        .fade-1 { animation: fadeUp 0.8s ease forwards; }
        .fade-2 { animation: fadeUp 0.8s ease 0.2s forwards; opacity: 0; }
        .fade-3 { animation: fadeUp 0.8s ease 0.4s forwards; opacity: 0; }
        .fade-4 { animation: fadeUp 0.8s ease 0.6s forwards; opacity: 0; }
        .fade-5 { animation: fadeUp 0.8s ease 0.8s forwards; opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .bohr-anim { animation: none; }
          .fade-1, .fade-2, .fade-3, .fade-4, .fade-5 { animation: none; opacity: 1; }
        }
      `}</style>

      {/* MOLECULE NETWORK CANVAS */}
      <canvas ref={canvasRef} style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.6
      }}/>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '380px' }}>

        {/* Bohr logo — breathing */}
        <div className="bohr-anim fade-1" style={{ marginBottom: '24px', display: 'inline-block' }}>
          <svg width="88" height="88" viewBox="0 0 160 160" fill="none">
            <g transform="rotate(-20, 80, 80)">
              <ellipse cx="80" cy="80" rx="68" ry="48" fill="none" stroke="#D4A843" strokeWidth="1.6"/>
              <circle cx="148" cy="80"  r="6" fill="white"/>
              <circle cx="114" cy="121" r="6" fill="white"/>
              <circle cx="46"  cy="121" r="6" fill="white"/>
              <circle cx="12"  cy="80"  r="6" fill="white"/>
              <circle cx="46"  cy="39"  r="6" fill="white"/>
              <circle cx="114" cy="39"  r="6" fill="white"/>
            </g>
            <circle cx="80" cy="80" r="36" fill="none" stroke="#D4A843" strokeWidth="1.6"/>
            <circle cx="80" cy="44"  r="6" fill="white"/>
            <circle cx="80" cy="116" r="6" fill="white"/>
            <circle cx="80" cy="80"  r="18" fill="white"/>
          </svg>
        </div>

        {/* Title */}
        <div className="fade-2">
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '48px',
            fontWeight: 300,
            marginBottom: '6px',
            lineHeight: 1,
            letterSpacing: '-0.5px'
          }}>
            Oxy<span style={{ color: '#D4A843' }}>Gen</span> Care
          </h1>
          <p style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '40px'
          }}>
            Haïti
          </p>
        </div>

        {/* Tagline */}
        <div className="fade-3" style={{ marginBottom: '52px' }}>
          <p style={{
            fontSize: '18px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.75,
            maxWidth: '300px',
            margin: '0 auto 12px'
          }}>
            Swiv{' '}
            <span style={{ color: '#D4A843', fontWeight: 500 }}>tansyon</span>
            {' '}ou ak{' '}
            <span style={{ color: '#D4A843', fontWeight: 500 }}>sik</span>
            {' '}ou chak jou.
          </p>
          <p style={{
            fontSize: '15px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7
          }}>
            Fanmi ou ap toujou konnen si ou anfòm.
          </p>
        </div>

        {/* CTAs */}
        <div className="fade-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <Link href="/care/login" style={{
            display: 'block',
            width: '100%',
            background: 'white',
            color: '#065C50',
            padding: '16px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 700,
            textDecoration: 'none',
            letterSpacing: '0.2px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            Kreye yon kont
          </Link>

          <Link href="/care/login?mode=signin" style={{
            display: 'block',
            width: '100%',
            background: 'rgba(255,255,255,0.10)',
            color: 'white',
            padding: '15px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 500,
            textDecoration: 'none',
            border: '1.5px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)'
          }}>
            Mwen deja gen yon kont
          </Link>
        </div>

        {/* Footer */}
        <div className="fade-5">
          <p style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.25)',
            marginTop: '48px',
            lineHeight: 1.8,
            letterSpacing: '0.3px'
          }}>
            OxyGen Care · OxyGen Haiti<br/>
            Port-au-Prince, Haïti
          </p>
        </div>

      </div>
    </div>
  )
}