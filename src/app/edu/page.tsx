import type { Metadata } from "next";
import { BookOpen, Sparkles, WifiOff, ShieldCheck, TrendingUp, ClipboardCheck, House, GraduationCap, Activity, Wifi, BatteryFull, Signal } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";

export const metadata: Metadata = {
  title: "OxyGen Edu — préparez le concours de médecine, vraiment prêt",
  description:
    "Préparation aux concours FMP/UNDH/UNIFA : 10 000+ questions validées, micro-leçons, feedback par IA. Hors ligne, en créole. 3 500 HTG / saison. Lancement janvier 2027.",
};

const opt = (t: string, on = false) => (
  <div style={{ background: on ? "var(--acc-bg)" : "#fff", border: on ? "2px solid var(--acc)" : "1px solid #E6EAF2", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: on ? 700 : 600, color: on ? "var(--acc-d)" : "#16213A" }}>{t}</div>
);

export default function EduPage() {
  return (
    <div className="osite">
      <Nav />
      <main className="p-edu">
        <header className="chero">
          <div className="wrap in">
            <div data-reveal="">
              <img src="/logo/produits/edu/svg/edu-logo-horizontal-light.svg" alt="OxyGen Edu" style={{ height: 44, display: "block", marginBottom: 18 }} />
              <span className="eyebrow">Prépa concours · FMP · UNDH · UNIFA</span>
              <h1>Préparez le concours de médecine. <span className="g">Vraiment prêt.</span></h1>
              <p className="lead">10 000+ questions validées, micro-leçons et feedback par IA. 4× moins cher et 8× plus long qu&apos;une prépa classique. Hors ligne, en kreyòl.</p>
              <div className="cta">
                <a href="#acces" className="btn btn-acc">Rejoindre la liste d&apos;attente <span className="arw">→</span></a>
                <a href="#comment" className="btn btn-outline">Comment ça marche</a>
              </div>
              <div className="trust"><span>Offline-first</span><span>MonCash · Natcash</span><span>En kreyòl</span><span>Anti-partage</span></div>
            </div>
            <div className="phone" aria-hidden="true">
              <div className="scr">
                <div className="island"></div>
                <div className="status"><span>9:41</span><span className="si"><Signal size={14} /><Wifi size={14} /><BatteryFull size={16} /></span></div>
                <div className="card">
                  <div className="k">Anatomie · Ostéologie — Q7/20</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8, lineHeight: 1.35 }}>Combien d&apos;os compte le carpe chez l&apos;adulte ?</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {opt("6 os")}
                  {opt("8 os", true)}
                  {opt("10 os")}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 6, background: "#E6EAF2", borderRadius: 3 }}><div style={{ width: "35%", height: "100%", background: "var(--acc)", borderRadius: 3 }}></div></div>
                  <div style={{ fontSize: 11, color: "#5A6678", marginTop: 6, fontWeight: 600 }}>35 % — série Ostéologie</div>
                </div>
                <div className="sp"></div>
                <div className="tabs">
                  <span className="tb on"><House size={20} /></span>
                  <span className="tb"><BookOpen size={20} /></span>
                  <span className="tb"><Activity size={20} /></span>
                  <span className="tb"><GraduationCap size={20} /></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="comment">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Comment ça marche</div><h2>Une méthode qui bat les prépas de 5 semaines.</h2></div>
            <div className="steps">
              <div className="step" data-reveal=""><div className="num">1</div><h3>Choisis ta matière</h3><p>Anatomie, biologie, chimie, physique, maths, français, anglais — tout le programme des concours.</p></div>
              <div className="step" data-reveal=""><div className="num">2</div><h3>Micro-leçon puis QCM</h3><p>Une notion courte, puis des questions validées pour l&apos;ancrer. En kreyòl, hors ligne.</p></div>
              <div className="step" data-reveal=""><div className="num">3</div><h3>Feedback IA & progression</h3><p>Des explications personnalisées et un suivi clair de tes points forts et faibles.</p></div>
            </div>
          </div>
        </section>

        <section className="unique">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Pourquoi Edu</div><h2>10 000+ questions. 8 mois d&apos;accompagnement.</h2></div>
            <div className="ugrid">
              <div className="u" data-reveal=""><div className="ic"><ClipboardCheck size={22} color="#2456C9" /></div><h3>10 000+ QCM validés</h3><p>Un banque de questions couvrant tout le programme officiel.</p></div>
              <div className="u" data-reveal=""><div className="ic"><BookOpen size={22} color="#2456C9" /></div><h3>Micro-leçons</h3><p>Des notions courtes et interactives, faciles à retenir.</p></div>
              <div className="u" data-reveal=""><div className="ic"><Sparkles size={22} color="#2456C9" /></div><h3>Feedback par IA</h3><p>Des explications adaptées à tes erreurs, à la demande.</p></div>
              <div className="u" data-reveal=""><div className="ic"><WifiOff size={22} color="#2456C9" /></div><h3>Hors ligne complet</h3><p>Révise partout, même sans connexion.</p></div>
              <div className="u" data-reveal=""><div className="ic"><ShieldCheck size={22} color="#2456C9" /></div><h3>Anti-partage</h3><p>Un compte, un candidat — le contenu reste protégé.</p></div>
              <div className="u" data-reveal=""><div className="ic"><TrendingUp size={22} color="#2456C9" /></div><h3>Suivi de progression</h3><p>Vois où tu en es, matière par matière.</p></div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Tarifs</div><h2>4× moins cher qu&apos;une prépa traditionnelle.</h2></div>
            <div className="pricing">
              <div className="pr feat" data-reveal=""><div className="badge">Offre de lancement</div><h3>Early Bird</h3><div className="amt">1 500 <span>HTG</span></div><div className="sub">prévente · places limitées</div><ul><li>Accès complet à la saison</li><li>Tarif réservé aux premiers inscrits</li></ul><a className="btn btn-acc" href="#acces">Rejoindre</a></div>
              <div className="pr" data-reveal=""><div className="badge">Saison</div><h3>Accès saison</h3><div className="amt">3 500 <span>HTG</span></div><div className="sub">8 mois d&apos;accompagnement</div><ul><li>10 000+ questions</li><li>Micro-leçons + feedback IA</li><li>Hors ligne, en kreyòl</li></ul><a className="btn btn-outline" href="#acces">Rejoindre</a></div>
              <div className="pr" data-reveal=""><div className="badge">Diaspora</div><h3>Depuis l&apos;étranger</h3><div className="amt">Carte <span>USD / EUR</span></div><div className="sub">un proche paie pour le candidat</div><ul><li>Paiement par carte bancaire</li><li>Même accès complet</li></ul><a className="btn btn-outline" href="#acces">Rejoindre</a></div>
            </div>
          </div>
        </section>

        <section className="ccta" id="acces">
          <div className="wrap"><div className="box">
            <div data-reveal="">
              <h2>Le concours, c&apos;est en janvier 2027.</h2>
              <p>Inscris-toi à la liste d&apos;attente pour être prévenu du lancement et profiter de l&apos;offre Early Bird.</p>
              <div className="cta">
                <a className="btn btn-white" href="/#acces">Rejoindre la liste d&apos;attente <span className="arw">→</span></a>
              </div>
            </div>
          </div></div>
        </section>
      </main>
      <Footer />
      <SiteEffects />
    </div>
  );
}
