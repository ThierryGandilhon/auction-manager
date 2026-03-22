import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/etudes', label: 'Études', icon: '⌂' },
  { to: '/auctions', label: 'Auctions', icon: '⚖' },
  { to: '/objets', label: 'Objets', icon: '◉' },
  { to: '/clients', label: 'Clients', icon: '◎' },
  { to: '/ventes', label: 'Ventes', icon: '◆' },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
            Auction
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
            Manager
          </div>
        </div>
        <div style={{ width: '80%', height: 1, background: 'var(--border)', margin: '0 auto 16px' }} />
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 2,
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              transition: 'all 0.15s',
              fontSize: 14,
            })}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', fontSize: 11, color: 'var(--text3)' }}>
          v2.0 · Local
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
