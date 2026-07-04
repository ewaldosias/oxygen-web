// Faint Bohr-oxygen-atom watermark for the product card headers.
const OUTER: [number, number][] = [
  [92, 0], [46, 80], [-46, 80], [-92, 0], [-46, -80], [46, -80],
];
const INNER: [number, number][] = [[0, 48], [0, -48]];

export default function CardPattern() {
  return (
    <svg className="pattern" viewBox="0 0 540 132" preserveAspectRatio="xMaxYMid slice">
      <g transform="translate(470 30)">
        <circle r="92" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.6" />
        <circle r="48" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.6" />
        {OUTER.map(([x, y], i) => (
          <circle key={`o${i}`} cx={x} cy={y} r="6" fill="#fff" fillOpacity="0.22" />
        ))}
        {INNER.map(([x, y], i) => (
          <circle key={`i${i}`} cx={x} cy={y} r="5.5" fill="#fff" fillOpacity="0.22" />
        ))}
        <circle r="11" fill="#E6BC58" fillOpacity="0.32" />
        <circle r="11" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.3" />
      </g>
    </svg>
  );
}
