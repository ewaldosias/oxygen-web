'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // OFFLINE BANNER + NAV SCROLL + MOLECULE CANVAS
  useEffect(() => {
    const banner = document.getElementById('offline-banner')
    const bannerMsg = document.getElementById('banner-msg')
    let bannerTimer: ReturnType<typeof setTimeout>

    function showBanner(msg: string, cls: string, autohide: boolean) {
      clearTimeout(bannerTimer)
      if (bannerMsg) bannerMsg.textContent = msg
      if (banner) banner.className = 'show ' + cls
      if (autohide) bannerTimer = setTimeout(() => { if (banner) banner.className = '' }, 2800)
    }
    const handleOffline = () => showBanner('✓ Mode hors ligne actif — tout le contenu est disponible', 'is-offline', false)
    const handleOnline  = () => showBanner('● Connexion rétablie', 'is-online', true)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)

    // NAV SCROLL
    const nav = document.getElementById('nav')
    const handleScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 50) }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // MOLECULE CANVAS
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    let raf: number
    let W = 0, H = 0

    function resize() { W = cvs!.width = cvs!.offsetWidth; H = cvs!.height = cvs!.offsetHeight }
    function init() {
      nodes = []
      const count = Math.min(30, Math.floor(W * H / 16000))
      for (let i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 2.2 + 1.4 })
      }
    }
    function tick() {
      ctx!.clearRect(0, 0, W, H)
      const MAX = 148
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
          const d = Math.hypot(dx, dy)
          if (d < MAX) {
            ctx!.strokeStyle = `rgba(212,168,67,${(1 - d / MAX) * 0.2})`
            ctx!.lineWidth = 0.9
            ctx!.beginPath(); ctx!.moveTo(nodes[i].x, nodes[i].y); ctx!.lineTo(nodes[j].x, nodes[j].y); ctx!.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx!.fillStyle = 'rgba(27,42,74,0.14)'
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx!.fill()
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
    const handleVisibility = () => { if (document.hidden) cancelAnimationFrame(raf); else if (!reduced) tick() }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('scroll',  handleScroll)
      window.removeEventListener('resize',  handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // SCROLL REVEAL + COUNTERS + TOUCH SHIMMER
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el))

    function animCount(el: Element, target: number, dur: number) {
      const t0 = performance.now();
      (function step(now: number) {
        const p = Math.min((now - t0) / dur, 1), ep = 1 - Math.pow(1 - p, 3)
        el.textContent = Math.floor(ep * target).toLocaleString('fr')
        if (p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString('fr')
      })(t0)
    }
    const ctrObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.ctr-val').forEach(el => animCount(el, +(el as HTMLElement).dataset.target!, 1800))
          ctrObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.25 })
    const countersEl = document.getElementById('counters')
    if (countersEl) ctrObs.observe(countersEl)

    document.querySelectorAll('.pcard').forEach(card => {
      card.addEventListener('touchstart', () => card.classList.add('hover'), { passive: true })
      card.addEventListener('touchend', () => setTimeout(() => card.classList.remove('hover'), 700), { passive: true })
    })

    return () => { revealObs.disconnect(); ctrObs.disconnect() }
  }, [])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // BOHR ATOM SVG — réutilisable
  const BohrSVG = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <g transform="rotate(-20, 80, 80)">
        <ellipse cx="80" cy="80" rx="68" ry="48" fill="none" stroke="#D4A843" strokeWidth="1.6"/>
        <circle cx="148" cy="80"  r="6" fill="#1B2A4A"/>
        <circle cx="114" cy="121" r="6" fill="#1B2A4A"/>
        <circle cx="46"  cy="121" r="6" fill="#1B2A4A"/>
        <circle cx="12"  cy="80"  r="6" fill="#1B2A4A"/>
        <circle cx="46"  cy="39"  r="6" fill="#1B2A4A"/>
        <circle cx="114" cy="39"  r="6" fill="#1B2A4A"/>
      </g>
      <circle cx="80" cy="80" r="36" fill="none" stroke="#D4A843" strokeWidth="1.6"/>
      <circle cx="80" cy="44"  r="6" fill="#1B2A4A"/>
      <circle cx="80" cy="116" r="6" fill="#1B2A4A"/>
      <circle cx="80" cy="80"  r="18" fill="#1B2A4A"/>
    </svg>
  )

  return (
    <>
      {/* OFFLINE BANNER */}
      <div id="offline-banner">
        <span id="banner-msg">✓ Mode hors ligne actif — tout le contenu est disponible</span>
      </div>

      {/* NAV */}
      <nav id="nav">
        <a href="#" className="logo-wrap">
          <svg width="38" height="38" viewBox="0 0 160 160" fill="none" aria-label="Logo OxyGen">
            <g transform="rotate(-20, 80, 80)">
              <ellipse cx="80" cy="80" rx="68" ry="48" fill="none" stroke="#D4A843" strokeWidth="3"/>
              <circle cx="148" cy="80"  r="8" fill="#1B2A4A"/>
              <circle cx="114" cy="121" r="8" fill="#1B2A4A"/>
              <circle cx="46"  cy="121" r="8" fill="#1B2A4A"/>
              <circle cx="12"  cy="80"  r="8" fill="#1B2A4A"/>
              <circle cx="46"  cy="39"  r="8" fill="#1B2A4A"/>
              <circle cx="114" cy="39"  r="8" fill="#1B2A4A"/>
            </g>
            <circle cx="80" cy="80" r="36" fill="none" stroke="#D4A843" strokeWidth="3"/>
            <circle cx="80" cy="44"  r="8" fill="#1B2A4A"/>
            <circle cx="80" cy="116" r="8" fill="#1B2A4A"/>
            <circle cx="80" cy="80"  r="20" fill="#1B2A4A"/>
          </svg>
          <div>
            <div className="logo-wordmark">Oxy<em>Gen</em></div>
            <div className="logo-country">Haïti</div>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#produits">OxyGen Care</a></li>
          <li><a href="#produits">OxyGen Edu</a></li>
          <li><a href="#produits">Clinic Academy</a></li>
          <li><a href="#cta" className="nav-cta">Accès anticipé</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <canvas ref={canvasRef} id="mol-canvas" />
        <div className="hero-inner">

          {/* LOGO + WORDMARK */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', marginBottom:'36px' }}>
            <div className="bohr-mark"><BohrSVG size={96} /></div>
            <div style={{ textAlign:'left', borderLeft:'1.5px solid rgba(212,168,67,0.3)', paddingLeft:'20px' }}>
              <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(36px,5vw,56px)', fontWeight:500, color:'#1B2A4A', lineHeight:1 }}>
                Oxy<span style={{ color:'#D4A843' }}>Gen</span>
              </div>
              <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'#6B7280', marginTop:'4px' }}>Haïti</div>
            </div>
          </div>

          <p className="hero-eyebrow">MedTech · EdTech · Haïti</p>
          <h1 className="hero-title">Former · Faciliter · <em>Connecter</em></h1>
          <p className="hero-sub">Construit pour les conditions les plus exigeantes.</p>

          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => scrollTo('cta')}>
              Rejoindre la liste d&apos;attente OxyGen Edu
            </button>
            <button className="btn-ghost" onClick={() => scrollTo('produits')}>
              Voir les produits →
            </button>
          </div>

          <div className="counters-row" id="counters">
            <div className="ctr">
              <span className="ctr-num">~<span className="ctr-val" data-target="2">0</span>M</span>
              <div className="ctr-lbl">haïtiens avec HTA<br/>non contrôlée</div>
            </div>
            <div className="ctr">
              <span className="ctr-num">+<span className="ctr-val" data-target="500">0</span><span className="ctr-sfx">K</span></span>
              <div className="ctr-lbl">diabétiques peu<br/>ou pas suivis</div>
            </div>
            <div className="ctr">
              <span className="ctr-num" style={{ fontSize:'42px', letterSpacing:'-1px' }}>Jan 2027</span>
              <div className="ctr-lbl">lancement<br/>OxyGen Edu</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products-section" id="produits">
        <div className="products-header reveal up">
          <p className="section-label">L&apos;écosystème OxyGen</p>
          <h2 className="section-title">Quatre produits.<br/>Un seul objectif.</h2>
          <div className="gold-rule"></div>
        </div>
        <div className="products-grid">

          <div className="pcard reveal left" style={{ transitionDelay:'.05s' }}>
            <div className="pcard-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 20c4.97 0 9-4.03 9-9S15.97 2 11 2 2 6.03 2 11s4.03 9 9 9z" stroke="#D4A843" strokeWidth="1.4"/><path d="M11 7v4l2.5 2.5" stroke="#D4A843" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <span className="pcard-badge">Patients · Familles</span>
            <h3 className="pcard-title">OxyGen Care</h3>
            <p className="pcard-desc">Suivi HTA et diabète, alertes famille. Les maladies chroniques suivies en temps réel, même sans connexion.</p>
            <div className="pcard-foot">
              <span className="pcard-price">2 000 HTG / 6 mois</span>
              <div className="pcard-arrow"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5H10.5M10.5 6.5L7 3M10.5 6.5L7 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
            </div>
          </div>

          <div className="pcard reveal up" style={{ transitionDelay:'.10s' }}>
            <div className="pcard-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L2 6.5 11 11 20 6.5 11 2Z" stroke="#D4A843" strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 15.5L11 20 20 15.5" stroke="#D4A843" strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 11L11 15.5 20 11" stroke="#D4A843" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </div>
            <span className="pcard-badge">Concours Facs de Médecine</span>
            <h3 className="pcard-title">OxyGen Edu</h3>
            <p className="pcard-desc">10 000+ questions validées, micro-leçons interactives, mode hors ligne complet. Explications en créole. 4× moins cher et 8× plus long qu&apos;une prépa traditionnelle.</p>
            <div className="pcard-foot">
              <span className="pcard-price">3 500 HTG / saison</span>
              <div className="pcard-arrow"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5H10.5M10.5 6.5L7 3M10.5 6.5L7 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
            </div>
          </div>

          <div className="pcard reveal up" style={{ transitionDelay:'.15s' }}>
            <div className="pcard-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M19.5 4.3a5 5 0 0 0-7.07 0L11 5.73l-1.43-1.43a5 5 0 0 0-7.07 7.07l1.43 1.43L11 20.2l7.07-7.07 1.43-1.43a5 5 0 0 0 0-7.07z" stroke="#D4A843" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </div>
            <span className="pcard-badge">Formations certifiantes</span>
            <h3 className="pcard-title">Clinic Academy</h3>
            <p className="pcard-desc">ECG, Radio Pulmonaire, cas cliniques simulés par IA. Certificat avec QR Code de vérification valable 2 ans.</p>
            <div className="pcard-foot">
              <span className="pcard-price">Lancement oct. 2027</span>
              <div className="pcard-arrow"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5H10.5M10.5 6.5L7 3M10.5 6.5L7 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
            </div>
          </div>

          <div className="pcard reveal right" style={{ transitionDelay:'.20s' }}>
            <div className="pcard-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h8a2 2 0 0 1 2 2v4M9 3v18m0 0h8a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h16" stroke="#0F6E56" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="pcard-badge pcard-free">Gratuit · Médecins · Internes · Infirmières</span>
            <h3 className="pcard-title">Shift + Clinical Tools</h3>
            <p className="pcard-desc">Shift organise vos patients et envoie les alertes de suivi. Les Clinical Tools ajoutent les calculateurs essentiels — scores, dosages, conversions. Gratuit, offline, pour ceux qui soignent.</p>
            <div className="pcard-foot">
              <span className="pcard-price free">Gratuit — toujours</span>
              <div className="pcard-arrow"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5H10.5M10.5 6.5L7 3M10.5 6.5L7 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
            </div>
          </div>

        </div>
      </section>

      {/* POURQUOI OXYGEN EXISTE */}
      <section className="why-section">
        <div className="why-header reveal up">
          <p className="section-label">Notre point de départ</p>
          <h2 className="section-title">Pourquoi OxyGen existe</h2>
          <div className="gold-rule"></div>
        </div>
        <div className="why-grid">
          <div className="why-card reveal left" style={{ transitionDelay:'.05s' }}>
            <span className="why-product">OxyGen Edu</span>
            <span className="why-stat">4× moins cher</span>
            <span className="why-stat-sub">8× plus long</span>
            <p className="why-desc">qu&apos;une préparation traditionnelle de 5 semaines — pour 8 mois d&apos;accompagnement structuré aux concours des facultés de médecine.</p>
          </div>
          <div className="why-card reveal right" style={{ transitionDelay:'.10s' }}>
            <span className="why-product">OxyGen Care</span>
            <span className="why-stat">+2,5M</span>
            <p className="why-desc">haïtiens vivant avec l&apos;hypertension artérielle ou le diabète, insuffisamment pris en charge faute d&apos;outils de suivi accessibles.</p>
          </div>
          <div className="why-card reveal left" style={{ transitionDelay:'.15s' }}>
            <span className="why-product">OxyGen Shift · Clinical Tools</span>
            <span className="why-stat">TROP PEU</span>
            <p className="why-desc">de professionnels de santé haïtiens utilisent un outil clinique numérique adapté à leurs conditions de travail réelles.</p>
          </div>
          <div className="why-card reveal right" style={{ transitionDelay:'.20s' }}>
            <span className="why-product">Vision 2035</span>
            <span className="why-stat">Quasi-inexistantes</span>
            <p className="why-desc">les données structurées sur l&apos;écosystème de santé haïtien — disponibles pour la recherche, la politique de santé publique, et la communauté scientifique internationale.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal up" id="cta">
        <p className="section-label">Accès anticipé</p>
        <h2 className="cta-title">Soyez parmi les premiers<br/>à accéder à <em>OxyGen Edu</em></h2>
        <p className="cta-sub">Lancement janvier 2027. Inscrivez-vous pour être notifié en priorité et accéder aux offres de lancement.</p>
        <div className="cta-form">
          <input className="cta-input" type="email" placeholder="votre@email.com"/>
          <button className="cta-btn">Je m&apos;inscris →</button>
        </div>
        <div className="tags-row">
          <span className="tag">Offline first</span>
          <span className="tag">MonCash</span>
          <span className="tag">Natcash</span>
          <span className="tag">En créole</span>
          <span className="tag">Mobile first</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">Oxy<em>Gen</em> Haïti</div>
        <p className="footer-copy">© 2026 OxyGen Haiti S.A. · Port-au-Prince, Haïti</p>
        <div className="footer-links">
          <a href="#">Confidentialité</a>
          <a href="#">Contact</a>
          <a href="#">Investisseurs</a>
        </div>
      </footer>
    </>
  )
}