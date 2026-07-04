// Bohr oxygen atom (2 inner + 6 outer electrons + gold nucleus).
// When `animate` is true, the electron shells slowly orbit the nucleus.
const V = { oR: 64, iR: 33, oer: 7, ier: 6.5, nuc: 17 };
const OUTER = [0, 60, 120, 180, 240, 300];
const INNER = [90, 270];
const pos = (a: number, r: number): [number, number] => [
  80 + r * Math.cos((a * Math.PI) / 180),
  80 - r * Math.sin((a * Math.PI) / 180),
];

export default function Atom({
  size = 40,
  mode = "navy",
  animate = false,
}: {
  size?: number;
  mode?: "navy" | "white";
  animate?: boolean;
}) {
  const rg = `url(#rg-${mode})`;
  const el = `url(#el-${mode})`;
  const outline = mode === "white" ? "#7E5C12" : "#16213A";
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" style={{ verticalAlign: "middle" }}>
      <circle cx="80" cy="80" r={V.oR} fill="none" stroke={rg} strokeWidth="4.5" />
      <circle cx="80" cy="80" r={V.iR} fill="none" stroke={rg} strokeWidth="4" />
      <g className={animate ? "atom-orbit-o" : undefined}>
        {OUTER.map((a, i) => {
          const [x, y] = pos(a, V.oR);
          return <circle key={`o${i}`} cx={x} cy={y} r={V.oer} fill={el} />;
        })}
      </g>
      <g className={animate ? "atom-orbit-i" : undefined}>
        {INNER.map((a, i) => {
          const [x, y] = pos(a, V.iR);
          return <circle key={`i${i}`} cx={x} cy={y} r={V.ier} fill={el} />;
        })}
      </g>
      <circle cx="80" cy="80" r={V.nuc} fill="url(#nu-gold)" />
      <circle cx="80" cy="80" r={V.nuc + 0.5} fill="none" stroke={outline} strokeWidth="2" />
      <ellipse
        cx={80 - V.nuc * 0.32}
        cy={80 - V.nuc * 0.38}
        rx={V.nuc * 0.42}
        ry={V.nuc * 0.3}
        fill="#fff"
        opacity="0.5"
      />
    </svg>
  );
}
