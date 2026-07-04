import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer>
      <div className="wrap footgrid">
        <div className="fcol fbrand">
          <span className="brand" style={{ fontSize: 20 }}><BrandLogo size={20} /><span className="ht">Haïti</span></span>
          <p>L&apos;écosystème de santé numérique haïtien. Former, suivre et connecter — hors ligne, du français au kreyòl.</p>
        </div>
        <div className="fcol">
          <h4>Produits</h4>
          <a href="/care">OxyGen Care</a><a href="/edu">OxyGen Edu</a><a href="/academy">Clinic Academy</a><a href="/shift">OxyGen Shift</a>
        </div>
        <div className="fcol">
          <h4>OxyGen</h4>
          <a href="/#pourquoi">Pourquoi OxyGen</a><a href="/#">Contact</a><a href="/#">Investisseurs</a><a href="/#">Confidentialité</a>
        </div>
      </div>
      <div className="wrap footbar">
        <span>© 2026 OxyGen Haiti S.A. · Port-au-Prince, Haïti</span>
        <span>Former · Suivre · Connecter</span>
      </div>
    </footer>
  );
}
