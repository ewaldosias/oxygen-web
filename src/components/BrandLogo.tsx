import Atom from "./Atom";

// The "atom-as-O" wordmark: atom + xy + Gen.
export default function BrandLogo({ size = 24 }: { size?: number }) {
  return (
    <>
      <Atom size={Math.round(size * 1.04)} mode="navy" />
      <span className="xy" style={{ marginLeft: ".01em" }}>
        xy
      </span>
      <span className="gen">Gen</span>
    </>
  );
}
