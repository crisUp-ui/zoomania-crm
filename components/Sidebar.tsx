'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Icons } from './Icons'

const PRINCIPAL = [
  { href: '/',          label: 'Dashboard',  Icon: Icons.dashboard },
  { href: '/agenda',    label: 'Agenda',      Icon: Icons.calendar },
  { href: '/clientes',  label: 'Clientes',   Icon: Icons.users },
  { href: '/mascotas',  label: 'Mascotas',   Icon: Icons.paw },
  { href: '/historial', label: 'Historial',  Icon: Icons.history },
]
const GESTION = [
  { href: '/facturacion', label: 'Facturación', Icon: Icons.invoice },
  { href: '/inventario',  label: 'Inventario',  Icon: Icons.package },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button className="mob-menu" onClick={() => setOpen(true)}>
        <Icons.menu />
      </button>
      {open && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 29 }}
        />
      )}
      <aside className={'sidebar' + (open ? ' open' : '')}>
        <div className="logo">
          <div className="logo-mark"><Icons.paw size={22} /></div>
          <div>
            <div className="logo-text">Zoomania</div>
            <div className="logo-sub">Clínica Veterinaria</div>
          </div>
        </div>
        <nav className="nav">
          <div className="nav-section">Principal</div>
          {PRINCIPAL.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={'nav-item' + (pathname === href ? ' active' : '')} onClick={close}>
              <Icon /><span>{label}</span>
            </Link>
          ))}
          <div className="nav-section">Gestión</div>
          {GESTION.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={'nav-item' + (pathname === href ? ' active' : '')} onClick={close}>
              <Icon /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="avatar">RP</div>
          <div>
            <div className="user-name">Rosa Palomino</div>
            <div className="user-role">Recepcionista</div>
          </div>
        </div>
      </aside>
    </>
  )
}
