export default function CareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#EEF2F7',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-manrope), Manrope, sans-serif'
    }}>
      {children}
    </div>
  )
}