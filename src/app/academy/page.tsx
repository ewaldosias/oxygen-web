import type { Metadata } from "next";
import { Activity, Scan, Sparkles, BadgeCheck, BookOpen, CirclePlay, House, GraduationCap, Award, Wifi, BatteryFull, Signal } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";

export const metadata: Metadata = {
  title: "OxyGen Clinic Academy — formez-vous, prouvez-le",
  description:
    "Formation médicale continue : ECG, radiologie pulmonaire, cas cliniques simulés par IA. Certificat avec QR Code vérifiable, valable 2 ans. Hors ligne.",
};

const lrow = (t: string, done: boolean) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #ECE7F3", borderRadius: 12, padding: "11px 13px" }}>
    <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "var(--acc)" : "#EDE9F5", color: done ? "#fff" : "#8B7EB8", fontSize: 12, fontWeight: 800 }}>{done ? "✓" : "•"}</span>
    <span style={{ fontWeight: 700, fontSize: 14, color: "#1A2332" }}>{t}</span>
  </div>
);

export default function AcademyPage() {
  return (
    <div className="osite">
      <Nav />
      <main className="p-academy">
        <header className="chero">
          <div className="wrap in">
            <div data-reveal="">
              <img src="/logo/produits/academy/svg/academy-logo-horizontal-light.svg" alt="OxyGen Clinic Academy" style={{ height: 44, display: "block", marginBottom: 18 }} />
              <span className="eyebrow">Formation médicale continue</span>
              <h1>Formez-vous. <span className="g">Prouvez-le.</span></h1>
              <p className="lead">ECG, radiologie pulmonaire, cas cliniques simulés par IA. Un certificat avec QR Code vérifiable, valable 2 ans. Hors ligne, pour les soignants haïtiens.</p>
              <div className="cta">
                <a href="#acces" className="btn btn-acc">Être prévenu du lancement <span className="arw">→</span></a>
                <a href="#comment" className="btn btn-outline">Voir les parcours</a>
              </div>
              <div className="trust"><span>Certifiant</span><span>IA clinique</span><span>Offline-first</span><span>QR vérifiable</span></div>
            </div>
            <div className="phone" aria-hidden="true">
              <div className="scr">
                <div className="island"></div>
                <div className="status"><span>9:41</span><span className="si"><Signal size={14} /><Wifi size={14} /><BatteryFull size={16} /></span></div>
                <div className="card">
                  <div className="k">Parcours ECG</div>
                  <div className="v" style={{ fontSize: 26 }}>8 / 10 <span>leçons</span></div>
                  <div className="pill">Bientôt certifié</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lrow("J7 · Bloc de branche", true)}
                  {lrow("J8 · Sus-décalage ST", true)}
                  {lrow("J9 · Cas clinique IA", false)}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 6, background: "#EDE9F5", borderRadius: 3 }}><div style={{ width: "80%", height: "100%", background: "var(--acc)", borderRadius: 3 }}></div></div>
                  <div style={{ fontSize: 11, color: "#5A6678", marginTop: 6, fontWeight: 600 }}>80 % — certificat à 100 %</div>
                </div>
                <div className="sp"></div>
                <div className="tabs">
                  <span className="tb on"><House size={20} /></span>
                  <span className="tb"><BookOpen size={20} /></span>
                  <span className="tb"><Award size={20} /></span>
                  <span className="tb"><GraduationCap size={20} /></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="comment">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Comment ça marche</div><h2>Apprendre, s&apos;exercer, se certifier.</h2></div>
            <div className="steps">
              <div className="step" data-reveal=""><div className="num">1</div><h3>Micro-leçons interactives</h3><p>Des leçons courtes avec schémas pédagogiques, à votre rythme, hors ligne.</p></div>
              <div className="step" data-reveal=""><div className="num">2</div><h3>Cas cliniques simulés par IA</h3><p>Entraînez-vous sur des cas réalistes, avec correction et explications.</p></div>
              <div className="step" data-reveal=""><div className="num">3</div><h3>Certificat vérifiable</h3><p>Obtenez un certificat avec QR Code, valable 2 ans — la preuve de votre formation.</p></div>
            </div>
          </div>
        </section>

        <section className="unique">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Les parcours</div><h2>Des compétences qui comptent au quotidien.</h2></div>
            <div className="ugrid">
              <div className="u" data-reveal=""><div className="ic"><Activity size={22} color="#5B3CC9" /></div><h3>ECG</h3><p>De la lecture de base aux urgences — 10 leçons, 7 simulateurs.</p></div>
              <div className="u" data-reveal=""><div className="ic"><Scan size={22} color="#5B3CC9" /></div><h3>Radiologie pulmonaire</h3><p>Reconnaître l&apos;essentiel sur une radio du thorax.</p></div>
              <div className="u" data-reveal=""><div className="ic"><Sparkles size={22} color="#5B3CC9" /></div><h3>Cas cliniques IA</h3><p>Des situations simulées, corrigées et expliquées.</p></div>
              <div className="u" data-reveal=""><div className="ic"><CirclePlay size={22} color="#5B3CC9" /></div><h3>Simulateurs interactifs</h3><p>Manipulez, testez, comprenez — pas juste des textes.</p></div>
              <div className="u" data-reveal=""><div className="ic"><BookOpen size={22} color="#5B3CC9" /></div><h3>Schémas pédagogiques</h3><p>Des visuels clairs pour ancrer chaque notion.</p></div>
              <div className="u" data-reveal=""><div className="ic"><BadgeCheck size={22} color="#5B3CC9" /></div><h3>Certificat QR · 2 ans</h3><p>Vérifiable en un scan, reconnu et daté.</p></div>
            </div>
          </div>
        </section>

        <section className="ccta" id="acces">
          <div className="wrap"><div className="box">
            <div data-reveal="">
              <h2>La formation continue, bientôt en poche.</h2>
              <p>Clinic Academy arrive. Inscrivez-vous pour être prévenu du lancement et des premiers parcours certifiants.</p>
              <div className="cta">
                <a className="btn btn-white" href="/#acces">Être prévenu <span className="arw">→</span></a>
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
