import type { Metadata } from "next";
import { BellRing, Users, Siren, LayoutDashboard, WifiOff, ScanLine, ShieldCheck, TriangleAlert, House, CirclePlus, Activity, Wifi, BatteryFull, Signal } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";

export const metadata: Metadata = {
  title: "OxyGen Care — votre médecin voit vos chiffres entre les visites",
  description:
    "Suivi quotidien de l'hypertension, du diabète et de la grossesse. Alertes au médecin et à la famille. Hors ligne, en créole. Dès 1 500 HTG / trimestre.",
};

export default function CarePage() {
  return (
    <div className="osite">
      <Nav />
      <main className="care">
        <header className="chero">
          <div className="wrap in">
            <div data-reveal="">
              <img src="/logo/produits/care/svg/care-logo-horizontal-light.svg" alt="OxyGen Care" style={{ height: 44, display: "block", marginBottom: 18 }} />
              <span className="eyebrow">Suivi des patients chroniques &amp; grossesse</span>
              <h1>Votre médecin voit vos <span className="g">chiffres</span> entre les visites.</h1>
              <p className="lead">Suivi quotidien de l&apos;hypertension, du diabète et de la grossesse. Le patient note ses mesures ; le médecin est alerté avant que ça se dégrade. Hors ligne, en kreyòl.</p>
              <div className="cta">
                <a href="/care/login" className="btn btn-acc">Rejoindre le pilote <span className="arw">→</span></a>
                <a href="#comment" className="btn btn-outline">Comment ça marche</a>
              </div>
              <div className="trust"><span>Offline-first</span><span>MonCash · Natcash</span><span>En kreyòl</span><span>Alertes famille</span></div>
            </div>
            <div className="phone" aria-hidden="true">
              <div className="scr">
                <div className="island"></div>
                <div className="status"><span>9:41</span><span className="si"><Signal size={14} /><Wifi size={14} /><BatteryFull size={16} /></span></div>
                <div className="hi">Bonjou,<b>Marie Joseph</b></div>
                <div className="card">
                  <div className="k"><span>●</span> Tansyon jodi a</div>
                  <div className="v">128/82 <span>mmHg</span></div>
                  <div className="pill">● Estab · nan objektif</div>
                </div>
                <div className="mini">
                  <div className="stat"><div className="sk">Sik</div><div className="sv">5.4 <span>mmol/L</span></div></div>
                  <div className="stat"><div className="sk">Pwa</div><div className="sv">68 <span>kg</span></div></div>
                </div>
                <div className="rem"><div className="sk"><TriangleAlert size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />Rapèl medikaman</div><div className="sv">Amlodipine — 8:00 PM</div></div>
                <div className="sp"></div>
                <div className="tabs">
                  <span className="tb on"><House size={20} /></span>
                  <span className="tb"><CirclePlus size={20} /></span>
                  <span className="tb"><Activity size={20} /></span>
                  <span className="tb"><Users size={20} /></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="comment">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Comment ça marche</div><h2>Simple pour le patient. Précieux pour le médecin.</h2></div>
            <div className="steps">
              <div className="step" data-reveal=""><div className="num">1</div><h3>Votre médecin vous invite</h3><p>Il vous envoie un lien par WhatsApp. Vous créez votre compte en un instant, relié à lui.</p></div>
              <div className="step" data-reveal=""><div className="num">2</div><h3>Vous notez vos chiffres</h3><p>Tension, glycémie, poids, symptômes — moins de 30 secondes par jour, même sans connexion.</p></div>
              <div className="step" data-reveal=""><div className="num">3</div><h3>Il est alerté à temps</h3><p>En cas de valeur critique, votre médecin et vos proches reçoivent une alerte immédiate.</p></div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Deux modules</div><h2>Maladies chroniques et grossesse.</h2></div>
            <div className="mods">
              <div className="mod" data-reveal="">
                <div className="mtop" style={{ background: "linear-gradient(145deg,#12A074,#0A5E43)" }}><h3>HTA &amp; Diabète</h3><p>Le suivi quotidien des maladies chroniques.</p></div>
                <ul>
                  <li>Tension artérielle et fréquence cardiaque</li>
                  <li>Glycémie à jeun et post-prandiale</li>
                  <li>Poids et adhérence au traitement</li>
                  <li>Alertes automatiques selon les seuils du médecin</li>
                </ul>
              </div>
              <div className="mod" data-reveal="">
                <div className="mtop" style={{ background: "linear-gradient(145deg,#1AA47E,#0B5E52)" }}><h3>Pass Grossesse</h3><p>Un suivi adapté à chaque trimestre.</p></div>
                <ul>
                  <li>Interface qui s&apos;adapte à la semaine de grossesse</li>
                  <li>Mouvements fœtaux (kick count)</li>
                  <li>Signes de pré-éclampsie auto-signalés</li>
                  <li>Alertes urgence : TA élevée, saignements, douleurs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="unique">
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Fonctionnalités</div><h2>Tout ce qu&apos;il faut pour un suivi sérieux.</h2></div>
            <div className="ugrid">
              <div className="u" data-reveal=""><div className="ic"><BellRing size={22} color="#0E8A5F" /></div><h3>Alertes multi-niveaux</h3><p>Rouge, orange, bleu — le médecin voit d&apos;abord ce qui compte.</p></div>
              <div className="u" data-reveal=""><div className="ic"><Users size={22} color="#0E8A5F" /></div><h3>Notifications famille</h3><p>Les proches sont prévenus en cas d&apos;anomalie critique.</p></div>
              <div className="u" data-reveal=""><div className="ic"><Siren size={22} color="#0E8A5F" /></div><h3>Bouton urgence</h3><p>GPS + message WhatsApp pré-rempli, en un geste.</p></div>
              <div className="u" data-reveal=""><div className="ic"><LayoutDashboard size={22} color="#0E8A5F" /></div><h3>Tableau de bord médecin</h3><p>Patients critiques, alertes, saisies — visibles en 15 secondes.</p></div>
              <div className="u" data-reveal=""><div className="ic"><WifiOff size={22} color="#0E8A5F" /></div><h3>Hors ligne</h3><p>Saisie sans connexion, synchronisée au retour du réseau.</p></div>
              <div className="u" data-reveal=""><div className="ic"><ScanLine size={22} color="#0E8A5F" /></div><h3>Scan IA</h3><p>Ordonnances et feuilles de consultation lues automatiquement.</p></div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="stitle" data-reveal=""><div className="kick" style={{ color: "var(--acc)" }}>Tarifs</div><h2>Pensés pour Haïti. Le médecin, gratuit.</h2><p>Le médecin accède gratuitement et reçoit un honoraire de suivi. Le patient est le seul payeur.</p></div>
            <div className="pricing">
              <div className="pr" data-reveal=""><div className="badge">Chronique</div><h3>Trimestriel</h3><div className="amt">1 500 <span>HTG</span></div><div className="sub">pour 3 mois</div><ul><li>HTA &amp; diabète</li><li>Alertes médecin + famille</li><li>Hors ligne</li></ul><a className="btn btn-outline" href="/care/login">Choisir</a></div>
              <div className="pr feat" data-reveal=""><div className="badge">Recommandé</div><h3>Annuel</h3><div className="amt">5 400 <span>HTG</span></div><div className="sub">par an · 3 mois offerts</div><ul><li>Tout le trimestriel</li><li>2 mois d&apos;économie</li><li>Suivi continu</li></ul><a className="btn btn-acc" href="/care/login">Choisir</a></div>
              <div className="pr" data-reveal=""><div className="badge">Grossesse</div><h3>Pass Grossesse</h3><div className="amt">3 500 <span>HTG</span></div><div className="sub">jusqu&apos;à J+30 post-partum</div><ul><li>Module obstétrique complet</li><li>Alertes pré-éclampsie</li><li>Paiement unique</li></ul><a className="btn btn-outline" href="/care/login">Choisir</a></div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="csec" data-reveal="">
              <div className="lock"><ShieldCheck size={30} color="#0E8A5F" /></div>
              <div className="cc">
                <h3>Vos données, protégées et isolées</h3>
                <p>Chaque patient ne voit que ses données ; chaque médecin ne voit que ses patients (Row Level Security). OxyGen Care est un outil de suivi et de communication : il ne pose pas de diagnostic et ne remplace pas une consultation. Les alertes sont informatives ; la responsabilité clinique reste celle du médecin traitant.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="ccta" id="pilote">
          <div className="wrap"><div className="box">
            <div data-reveal="">
              <h2>Prêt à suivre vos patients autrement ?</h2>
              <p>Nous lançons un pilote avec quelques médecins. Rejoignez-le, ou inscrivez-vous pour être prévenu du lancement.</p>
              <div className="cta">
                <a className="btn btn-white" href="/care/login">Médecin : rejoindre le pilote <span className="arw">→</span></a>
                <a className="btn btn-outline" href="/care/login" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.5)" }}>Patient : accès anticipé</a>
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
