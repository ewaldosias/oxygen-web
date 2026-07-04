import type { Metadata } from "next";
import { ClipboardList, NotebookPen, ArrowRightLeft, Calculator, BellRing, WifiOff, House, Users, Wifi, BatteryFull, Signal } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";

export const metadata: Metadata = {
  title: "OxyGen Shift — votre garde, organisée. Gratuit, pour toujours",
  description:
    "Carnet de garde intelligent pour internes et soignants : census patients, notes SOAP, passation, calculateurs cliniques. Hors ligne. Gratuit.",
};

const prow = (name: string, room: string, dot: string) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #ECE7E4", borderRadius: 12, padding: "11px 13px" }}>
    <span style={{ width: 9, height: 9, borderRadius: "50%", background: dot }}></span>
    <span style={{ fontWeight: 700, fontSize: 14, color: "#1A2332" }}>{name}</span>
    <span style={{ marginLeft: "auto", fontSize: 12, color: "#7A6B64", fontWeight: 600 }}>{room}</span>
  </div>
);

export default function ShiftPage() {
  return (
    <div className="osite">
      <Nav />
      <main className="p-shift">
        <header className="chero">
          <div className="wrap in">
            <div data-reveal="">
              <img src="/logo/produits/shift/svg/shift-logo-horizontal-light.svg" alt="OxyGen Shift" style={{ height: 44, display: "block", marginBottom: 18 }} />
              <span className="eyebrow">Internes · Résidents · Soignants</span>
              <h1>Votre garde, organisée. <span className="g">Gratuit, pour toujours.</span></h1>
              <p className="lead">Vos patients, vos notes de garde, la passation et les calculateurs cliniques — dans une seule app, hors ligne. Pour ceux qui soignent.</p>
              <div className="cta">
                <a href="#acces" className="btn btn-acc">Rejoindre la beta <span className="arw">→</span></a>
                <a href="#comment" className="btn btn-outline">Comment ça marche</a>
              </div>
              <div className="trust"><span>Gratuit</span><span>Offline-first</span><span>Notes SOAP</span><span>Passation</span></div>
            </div>
            <div className="phone" aria-hidden="true">
              <div className="scr">
                <div className="island"></div>
                <div className="status"><span>9:41</span><span className="si"><Signal size={14} /><Wifi size={14} /><BatteryFull size={16} /></span></div>
                <div className="card">
                  <div className="k">Ma garde · Médecine interne</div>
                  <div className="v" style={{ fontSize: 26 }}>6 <span>patients</span></div>
                  <div className="pill">2 à surveiller</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {prow("Joseph M.", "Ch. 204", "#E24B4A")}
                  {prow("Pierre L.", "Ch. 208", "#EF9F27")}
                  {prow("Marie C.", "Ch. 211", "#1D9E75")}
                  {prow("André S.", "Ch. 215", "#1D9E75")}
                </div>
                <div className="sp"></div>
                <div className="tabs">
                  <span className="tb on"><House size={20} /></span>
                  <span className="tb"><ClipboardList size={20} /></span>
                  <span className="tb"><Calculator size={20} /></span>
                  <span className="tb"><ArrowRightLeft size={20} /></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="comment">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Comment ça marche</div><h2>Toute votre garde, au même endroit.</h2></div>
            <div className="steps">
              <div className="step" data-reveal=""><div className="num">1</div><h3>Ajoutez vos patients</h3><p>Créez votre census en quelques secondes, avec chambre, diagnostic et tâches.</p></div>
              <div className="step" data-reveal=""><div className="num">2</div><h3>Notez l&apos;évolution</h3><p>Notes SOAP structurées, tâches à faire, valeurs à surveiller — hors ligne.</p></div>
              <div className="step" data-reveal=""><div className="num">3</div><h3>Passez la garde proprement</h3><p>Un résumé clair pour la passation — plus rien ne se perd entre deux équipes.</p></div>
            </div>
          </div>
        </section>

        <section className="unique">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Ce que Shift fait pour vous</div><h2>L&apos;assistant de garde des soignants haïtiens.</h2></div>
            <div className="ugrid">
              <div className="u" data-reveal=""><div className="ic"><ClipboardList size={22} color="#CC4E22" /></div><h3>Census patients</h3><p>La liste de vos patients, à jour, toujours à portée.</p></div>
              <div className="u" data-reveal=""><div className="ic"><NotebookPen size={22} color="#CC4E22" /></div><h3>Notes SOAP</h3><p>Des observations structurées, rapides à saisir.</p></div>
              <div className="u" data-reveal=""><div className="ic"><ArrowRightLeft size={22} color="#CC4E22" /></div><h3>Passation</h3><p>Un handoff clair d&apos;une équipe à l&apos;autre.</p></div>
              <div className="u" data-reveal=""><div className="ic"><Calculator size={22} color="#CC4E22" /></div><h3>Calculateurs cliniques</h3><p>Scores, dosages, conversions — les essentiels intégrés.</p></div>
              <div className="u" data-reveal=""><div className="ic"><BellRing size={22} color="#CC4E22" /></div><h3>Alertes de suivi</h3><p>Ne manquez plus une valeur ou une tâche importante.</p></div>
              <div className="u" data-reveal=""><div className="ic"><WifiOff size={22} color="#CC4E22" /></div><h3>Hors ligne</h3><p>Tout fonctionne sans connexion, partout.</p></div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap" style={{ maxWidth: 700 }}>
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Tarif</div><h2>Gratuit. Pour toujours.</h2><p>Shift est et restera gratuit pour tous les soignants — parce que ceux qui soignent méritent de bons outils.</p></div>
          </div>
        </section>

        <section className="ccta" id="acces">
          <div className="wrap"><div className="box">
            <div data-reveal="">
              <h2>Prenez votre prochaine garde en main.</h2>
              <p>Rejoignez la beta et aidez-nous à bâtir l&apos;outil de garde des soignants d&apos;Haïti.</p>
              <div className="cta">
                <a className="btn btn-white" href="/#acces">Rejoindre la beta <span className="arw">→</span></a>
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
