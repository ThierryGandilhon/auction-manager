interface Props {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export default function StatCard({ label, value, sub, color = 'var(--accent)' }: Props) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 24px',
    }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontFamily: 'DM Serif Display, serif', color }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
