// Shared gradient definitions for the Bohr atom (rendered once).
export default function AtomDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="rg-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3C5A8C" />
          <stop offset="100%" stopColor="#1B2A4A" />
        </linearGradient>
        <radialGradient id="el-navy" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#5E73A0" />
          <stop offset="55%" stopColor="#243A63" />
          <stop offset="100%" stopColor="#111E38" />
        </radialGradient>
        <linearGradient id="rg-white" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D3DEEE" />
        </linearGradient>
        <radialGradient id="el-white" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#DCE5F1" />
          <stop offset="100%" stopColor="#B4C0D6" />
        </radialGradient>
        <radialGradient id="nu-gold" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FCEFC6" />
          <stop offset="45%" stopColor="#E6BC58" />
          <stop offset="100%" stopColor="#B6852A" />
        </radialGradient>
      </defs>
    </svg>
  );
}
