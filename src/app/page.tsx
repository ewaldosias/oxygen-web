import { User, Stethoscope, GraduationCap, WifiOff, Wallet, Languages, MapPin, Sparkles, Users } from "lucide-react";
import Atom from "@/components/Atom";
import CardPattern from "@/components/CardPattern";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";

const products = [
  { k: "Care", href: "/care", accent: "var(--care)", sq: ["#12A074", "#0A5E43"], role: "Patients · Familles", chip: "Bientôt", price: "Dès 1 500 HTG / trimestre", desc: "Suivi des maladies chroniques (HTA, diabète) et de la grossesse. Le médecin voit vos chiffres entre les visites — alertes à la famille en cas d'anomalie." },
  { k: "Edu", href: "/edu", accent: "var(--edu)", sq: ["#3470EE", "#1B3F9E"], role: "Concours Médecine", chip: "Janv. 2027", price: "3 500 HTG / saison", desc: "Préparation aux concours FMP/UNDH/UNIFA. 10 000+ questions validées, micro-leçons, explications en créole, hors ligne complet." },
  { k: "Clinic Academy", href: "/academy", accent: "var(--acad)", sq: ["#7350EA", "#3F2A9E"], role: "Formation continue", chip: "À venir", price: "Certifiant", desc: "ECG, radiologie pulmonaire, cas cliniques simulés par IA. Certificat avec QR Code de vérification valable 2 ans." },
  { k: "Shift", href: "/shift", accent: "var(--shift)", sq: ["#ED6A3A", "#B23E1C"], role: "Internes · Soignants", chip: "Beta", price: "Gratuit — toujours", desc: "Carnet de garde intelligent : organise vos patients, envoie les alertes de suivi, et regroupe les calculateurs cliniques essentiels." },
];

export default function Home() {
  return (
    <div className="osite">
      <Nav />

      <header className="hero">
        <div className="bg"><img src="/hero-illustration.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></div>
        <img className="heroimg" src="/hero.jpg" alt="" />
        <div className="scrim"></div>
        <div className="hero-mark" aria-hidden="true"><Atom size={520} mode="navy" animate /></div>
        <div className="wrap heroin">
          <div className="herocontent">
            <span className="eyebrow">MedTech · EdTech · 100% Haïti</span>
            <h1>L&apos;écosystème de santé <span className="g">numérique</span> haïtien.</h1>
            <p className="lead">Un seul objectif : former, suivre et connecter — pensé pour les conditions réelles d&apos;Haïti. Hors ligne, du français au kreyòl.</p>
            <div className="cta">
              <a href="#produits" className="btn btn-gold">Découvrir les produits <span className="arw">→</span></a>
              <a href="#acces" className="btn btn-outline">Rejoindre l&apos;accès anticipé</a>
            </div>
            <div className="trust"><span>Offline-first</span><span>MonCash · Natcash</span><span>Français · Kreyòl</span><span>Mobile-first</span></div>
          </div>
        </div>
      </header>

      <section className="statsband"><div className="wrap">
        <div className="stats">
          <div className="s" data-reveal=""><div className="n">+2,5<b>M</b></div><div className="l">Haïtiens avec HTA ou diabète, peu suivis</div></div>
          <div className="s" data-reveal=""><div className="n">480</div><div className="l">Décès maternels / 100 000 — 1er des Amériques</div></div>
          <div className="s" data-reveal=""><div className="n">8 000</div><div className="l">Candidats aux concours de Médecine / an</div></div>
          <div className="s" data-reveal=""><div className="n"><b>1er</b></div><div className="l">écosystème de santé numérique 100% haïtien</div></div>
        </div>
      </div></section>

      <section className="audience" id="vous-etes">
        <div className="wrap">
          <div className="stitle" data-reveal=""><div className="kick">Pour qui ?</div><h2>Trouvez votre espace.</h2><p>Patient, médecin ou futur médecin — OxyGen a un parcours pensé pour vous.</p></div>
          <div className="aud-grid">
            <a href="/care" className="aud" data-reveal="">
              <span className="bar" style={{ background: "var(--care)" }}></span>
              <div className="ic" style={{ background: "linear-gradient(145deg,#12A074,#0A5E43)" }}><User size={24} color="#fff" /></div>
              <h3>Patient ou proche</h3>
              <p>Suivez votre tension, votre diabète ou votre grossesse, et restez relié à votre médecin — même hors ligne.</p>
              <span className="go" style={{ color: "var(--care)" }}>OxyGen Care →</span>
            </a>
            <a href="/care" className="aud" data-reveal="">
              <span className="bar" style={{ background: "var(--gold)" }}></span>
              <div className="ic" style={{ background: "linear-gradient(145deg,#2E4575,#16213A)" }}><Stethoscope size={24} color="#fff" /></div>
              <h3>Médecin ou soignant</h3>
              <p>Suivez vos patients entre les visites, gérez vos gardes et formez-vous en continu.</p>
              <span className="go" style={{ color: "#1B2A4A" }}>Care · Shift · Academy →</span>
            </a>
            <a href="/edu" className="aud" data-reveal="">
              <span className="bar" style={{ background: "var(--edu)" }}></span>
              <div className="ic" style={{ background: "linear-gradient(145deg,#3470EE,#1B3F9E)" }}><GraduationCap size={24} color="#fff" /></div>
              <h3>Étudiant en médecine</h3>
              <p>Préparez les concours FMP/UNDH/UNIFA avec 10 000+ questions validées et des explications en créole.</p>
              <span className="go" style={{ color: "var(--edu)" }}>OxyGen Edu →</span>
            </a>
          </div>
        </div>
      </section>

      <section id="produits">
        <div className="wrap">
          <div className="stitle" data-reveal=""><div className="kick">L&apos;écosystème OxyGen</div><h2>Des produits complémentaires, un seul écosystème de santé.</h2><p>Du concours de médecine au suivi des patients chroniques — OxyGen couvre toute la chaîne, pour les soignants comme pour les patients.</p></div>
          <div className="grid4">
            {products.map((p) => (
              <a className="pcard" href={p.href} data-reveal="" key={p.k}>
                <div className="phead" style={{ background: `linear-gradient(135deg,${p.sq[0]},${p.sq[1]})` }}>
                  <CardPattern />
                  <div className="picon"><Atom size={50} mode="white" /></div>
                  <div className="ptitle"><div className="role">{p.role}</div><h3>OxyGen {p.k}</h3></div>
                  <span className="chip-h">{p.chip}</span>
                </div>
                <div className="pbody">
                  <p>{p.desc}</p>
                  <div className="meta"><span className="price" style={{ color: p.accent }}>{p.price}</span><span className="more" style={{ color: p.accent }}>En savoir plus <span className="arw">→</span></span></div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="unique">
        <div className="wrap">
          <div className="stitle" data-reveal=""><div className="kick">Ce qui nous rend uniques</div><h2>Pensé pour Haïti, là où les autres ne vont pas.</h2></div>
          <div className="ugrid">
            <div className="u" data-reveal=""><div className="ic"><WifiOff size={22} color="#1B2A4A" /></div><h3>Hors ligne d&apos;abord</h3><p>Tout fonctionne sans connexion ; les données se synchronisent dès que le réseau revient.</p></div>
            <div className="u" data-reveal=""><div className="ic"><Wallet size={22} color="#1B2A4A" /></div><h3>MonCash &amp; Natcash</h3><p>Paiement local intégré, plus la carte bancaire pour la diaspora.</p></div>
            <div className="u" data-reveal=""><div className="ic"><Languages size={22} color="#1B2A4A" /></div><h3>En créole &amp; français</h3><p>Une interface et des explications dans la langue de chacun.</p></div>
            <div className="u" data-reveal=""><div className="ic"><MapPin size={22} color="#1B2A4A" /></div><h3>Haïtien de bout en bout</h3><p>Protocoles, prix en HTG, contexte : pensé ici, pas adapté de l&apos;étranger.</p></div>
            <div className="u" data-reveal=""><div className="ic"><Sparkles size={22} color="#1B2A4A" /></div><h3>IA intégrée</h3><p>Scan d&apos;ordonnances et de feuilles, assistance clinique, transcription vocale.</p></div>
            <div className="u" data-reveal=""><div className="ic"><Users size={22} color="#1B2A4A" /></div><h3>Équipe haïtienne</h3><p>Des médecins et soignants d&apos;Haïti, pour les réalités d&apos;Haïti.</p></div>
          </div>
        </div>
      </section>

      <section className="fsc">
        <div className="wrap">
          <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--gold-l)" }}>Un écosystème, pas des apps isolées</div><h2>Former · Suivre · Connecter.</h2><p>Trois missions, des produits qui se répondent — du concours de médecine à la pratique quotidienne.</p></div>
          <div className="fscgrid">
            <div className="fscol" data-reveal="">
              <div className="verb">Former</div>
              <div className="d">Préparer les concours, puis se former tout au long de la carrière.</div>
              <a className="prod" href="/edu"><span className="dot" style={{ background: "#3470EE" }}></span>OxyGen Edu</a><a className="prod" href="/academy"><span className="dot" style={{ background: "#7350EA" }}></span>Clinic Academy</a>
            </div>
            <div className="fscol" data-reveal="">
              <div className="verb">Suivre</div>
              <div className="d">Suivre les patients chroniques et les grossesses, entre les visites.</div>
              <a className="prod" href="/care"><span className="dot" style={{ background: "#12A074" }}></span>OxyGen Care</a>
            </div>
            <div className="fscol" data-reveal="">
              <div className="verb">Connecter</div>
              <div className="d">Relier soignants, patients et données — gardes, alertes, outils cliniques.</div>
              <a className="prod" href="/shift"><span className="dot" style={{ background: "#ED6A3A" }}></span>OxyGen Shift</a>
            </div>
          </div>
        </div>
      </section>

      <section id="pourquoi" className="why">
        <div className="wrap">
          <div className="stitle" data-reveal=""><div className="kick">Pourquoi OxyGen existe</div><h2>Un vide que personne d&apos;autre ne comble.</h2>
            <p>Aucune plateforme numérique haïtienne n&apos;existait pour résoudre ces problèmes. Nous les prenons un par un.</p></div>
          <div className="whygrid">
            <div className="wc" data-reveal=""><div className="big">30<b>%</b></div><div className="t">des adultes haïtiens sont hypertendus — la majorité l&apos;ignore.</div></div>
            <div className="wc" data-reveal=""><div className="big">95<b>%</b></div><div className="t">des candidats aux Facs de Médecine échouent, souvent faute de préparation structurée.</div></div>
            <div className="wc" data-reveal=""><div className="big">4×</div><div className="t">moins cher et 8× plus long qu&apos;une prépa traditionnelle de 5 semaines.</div></div>
            <div className="wc" data-reveal=""><div className="big">2035</div><div className="t">des données de santé structurées pour la recherche et la politique publique.</div></div>
          </div>
        </div>
      </section>

      <section className="quote">
        <div className="wrap"><div className="box" data-reveal="">
          <div className="portrait" id="portrait">
            <img src="/leo_pho.jpg" alt="Dr Ewald Osias" style={{ position: "absolute", inset: 0, zIndex: 2 }} />
            <div className="ph"><div className="in">EO</div><div className="lb">Votre photo ici</div></div>
          </div>
          <div className="qtext">
            <div className="qmark">&ldquo;</div>
            <blockquote>Trop de patients sont seuls ; trop d&apos;étudiants brillants échouent faute d&apos;outils. OxyGen relie les soignants, les patients et les futurs médecins — un écosystème de santé pensé en Haïti, de bout en bout.</blockquote>
            <div className="who">Dr Ewald Osias</div>
            <div className="role">Médecin · Fondateur &amp; CEO, OxyGen Haïti</div>
          </div>
        </div></div>
      </section>

      <section className="news" id="veille">
        <div className="wrap">
          <div className="topbar" data-reveal="">
            <div className="stitle" style={{ textAlign: "left", margin: 0, maxWidth: "none" }}><div className="kick">Veille santé</div><h2 style={{ fontSize: 32 }}>Haïti &amp; monde</h2></div>
            <a href="#">Toute la veille →</a>
          </div>
          <div className="ngrid">
            <article className="ncard" data-reveal="">
              <div className="nimg" style={{ background: "linear-gradient(135deg,#2E4575,#16213A)" }}><span className="ncat" style={{ color: "#1B2A4A" }}>Monde · OMS</span></div>
              <div className="nbody"><div className="ndate">Juin 2026</div><h3>Hypertension : l&apos;OMS actualise ses recommandations de prise en charge</h3><p>De nouveaux seuils et un suivi renforcé pour réduire les complications cardiovasculaires.</p><span className="read">Lire →</span></div>
            </article>
            <article className="ncard" data-reveal="">
              <div className="nimg" style={{ background: "linear-gradient(135deg,#12A074,#0A5E43)" }}><span className="ncat" style={{ color: "#0E8A5F" }}>Caraïbes · PAHO</span></div>
              <div className="nbody"><div className="ndate">Mai 2026</div><h3>Mortalité maternelle dans les Caraïbes : Haïti reste la priorité</h3><p>Surveillance de la pré-éclampsie et suivi prénatal au cœur des plans régionaux.</p><span className="read">Lire →</span></div>
            </article>
            <article className="ncard" data-reveal="">
              <div className="nimg" style={{ background: "linear-gradient(135deg,#ED6A3A,#B23E1C)" }}><span className="ncat" style={{ color: "#CC4E22" }}>Haïti · MSPP</span></div>
              <div className="nbody"><div className="ndate">Avril 2026</div><h3>Maladies chroniques : vers un meilleur suivi des patients en Haïti</h3><p>Le numérique identifié comme levier pour relier patients et soignants entre les visites.</p><span className="read">Lire →</span></div>
            </article>
          </div>
          <p className="note">Exemples de mise en page — les articles réels seront branchés sur des sources (OMS, PAHO, MSPP…) à l&apos;intégration.</p>
        </div>
      </section>

      <section className="ctaband" id="acces">
        <div className="wrap"><div className="box">
          <div className="inner" data-reveal="">
            <h2>Restez informé. Accédez en premier à <span className="g">OxyGen</span>.</h2>
            <p>Lancement progressif dès 2026 — et l&apos;essentiel de la e-santé, Haïti &amp; monde, dans votre boîte mail.</p>
            <div className="signup">
              <input type="email" placeholder="Votre adresse e-mail" aria-label="Adresse e-mail" />
              <button className="btn btn-gold" type="button">Je m&apos;inscris <span className="arw">→</span></button>
            </div>
            <div className="note">Pas de spam. Désinscription en un clic.</div>
          </div>
        </div></div>
      </section>

      <Footer />

      <SiteEffects />
    </div>
  );
}
