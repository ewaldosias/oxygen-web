import BrandLogo from "./BrandLogo";

// Shared top navigation (links resolve to homepage anchors from any page).
export default function Nav() {
  return (
    <nav>
      <div className="wrap navin">
        <a className="brand" href="/"><BrandLogo size={24} /><span className="ht">Haïti</span></a>
        <div className="navlinks">
          <a href="/#vous-etes">Pour qui</a><a href="/#produits">Produits</a><a href="/#veille">Veille</a>
          <a href="/#acces" className="btn btn-dark">Accès anticipé</a>
        </div>
        <button className="navtoggle" id="navtoggle" aria-label="Ouvrir le menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
      <div className="mobilemenu" id="mobilemenu">
        <a href="/#vous-etes">Pour qui</a>
        <a href="/#produits">Produits</a>
        <a href="/#veille">Veille santé</a>
        <a href="/#acces" className="btn btn-dark" style={{ width: "100%", justifyContent: "center" }}>Accès anticipé</a>
      </div>
    </nav>
  );
}
