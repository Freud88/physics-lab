import { Link, useLocation } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors">
            <FlaskConical size={20} />
            <span className="font-semibold tracking-tight">Laboratorio di Fisica</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/cinematica" active={location.pathname.startsWith('/cinematica')}>
              Cinematica
            </NavLink>
            <NavLink to="/dinamica" active={location.pathname.startsWith('/dinamica')} disabled>
              Dinamica
            </NavLink>
            <NavLink to="/ottica" active={location.pathname.startsWith('/ottica')} disabled>
              Ottica
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

interface NavLinkProps {
  to: string
  active: boolean
  disabled?: boolean
  children: React.ReactNode
}

function NavLink({ to, active, disabled, children }: NavLinkProps) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 rounded text-slate-600 cursor-not-allowed select-none text-xs">
        {children}
      </span>
    )
  }
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded transition-colors ${
        active
          ? 'bg-sky-500/20 text-sky-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      }`}
    >
      {children}
    </Link>
  )
}
