import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Zap, Circle, Flame, Lightbulb, Magnet } from 'lucide-react'

interface ModuleCard {
  title: string
  description: string
  icon: React.ReactNode
  path: string
  available: boolean
  topics: string[]
  color: string
}

const modules: ModuleCard[] = [
  {
    title: 'Cinematica',
    description: 'Studia il moto dei corpi: uniforme, uniformemente accelerato e circolare.',
    icon: <Clock size={28} />,
    path: '/cinematica',
    available: true,
    topics: ['MRU', 'MRUA', 'MCU'],
    color: 'sky',
  },
  {
    title: 'Dinamica',
    description: 'Forze, piano inclinato, attrito statico e dinamico.',
    icon: <Zap size={28} />,
    path: '/dinamica',
    available: false,
    topics: ['Forze', 'Piano inclinato', 'Attrito'],
    color: 'violet',
  },
  {
    title: 'Oscillazioni',
    description: 'Pendolo semplice, moto armonico e smorzamento.',
    icon: <Circle size={28} />,
    path: '/oscillazioni',
    available: false,
    topics: ['Pendolo', 'MAS', 'Smorzamento'],
    color: 'emerald',
  },
  {
    title: 'Termodinamica',
    description: 'Gas ideale, cicli termodinamici e diagrammi PV.',
    icon: <Flame size={28} />,
    path: '/termodinamica',
    available: false,
    topics: ['Gas ideale', 'Cicli PV', 'Leggi dei gas'],
    color: 'orange',
  },
  {
    title: 'Ottica',
    description: 'Rifrazione, specchi, lenti convergenti e divergenti.',
    icon: <Lightbulb size={28} />,
    path: '/ottica',
    available: false,
    topics: ['Rifrazione', 'Specchi', 'Lenti'],
    color: 'yellow',
  },
  {
    title: 'Elettromagnetismo',
    description: 'Campo elettrico, condensatori, linee di campo.',
    icon: <Magnet size={28} />,
    path: '/elettromagnetismo',
    available: false,
    topics: ['Campo E', 'Condensatori', 'Dipolo'],
    color: 'rose',
  },
]

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string; hover: string }> = {
  sky: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30 hover:border-sky-400/60',
    icon: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-300',
    hover: 'hover:bg-sky-500/5',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-slate-700/50',
    icon: 'text-violet-400',
    badge: 'bg-slate-700 text-slate-400',
    hover: '',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-slate-700/50',
    icon: 'text-emerald-400',
    badge: 'bg-slate-700 text-slate-400',
    hover: '',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-slate-700/50',
    icon: 'text-orange-400',
    badge: 'bg-slate-700 text-slate-400',
    hover: '',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-slate-700/50',
    icon: 'text-yellow-400',
    badge: 'bg-slate-700 text-slate-400',
    hover: '',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-slate-700/50',
    icon: 'text-rose-400',
    badge: 'bg-slate-700 text-slate-400',
    hover: '',
  },
}

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
          Laboratorio Virtuale di Fisica
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Simulazioni interattive per esplorare i principi della fisica. Seleziona un modulo per iniziare.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const c = colorMap[mod.color]!
          if (mod.available) {
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className={`group relative flex flex-col p-6 rounded-xl border bg-slate-900 ${c.border} ${c.hover} transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-lg ${c.bg} flex items-center justify-center mb-4 ${c.icon}`}>
                  {mod.icon}
                </div>
                <h2 className="text-lg font-semibold text-slate-100 mb-1">{mod.title}</h2>
                <p className="text-slate-400 text-sm mb-4 flex-1">{mod.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mod.topics.map((t) => (
                    <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>{t}</span>
                  ))}
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${c.icon} group-hover:gap-2 transition-all`}>
                  Apri simulazione <ArrowRight size={14} />
                </div>
              </Link>
            )
          }
          return (
            <div
              key={mod.path}
              className={`relative flex flex-col p-6 rounded-xl border bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed select-none`}
            >
              <div className={`w-12 h-12 rounded-lg ${c.bg} flex items-center justify-center mb-4 ${c.icon}`}>
                {mod.icon}
              </div>
              <h2 className="text-lg font-semibold text-slate-300 mb-1">{mod.title}</h2>
              <p className="text-slate-500 text-sm mb-4 flex-1">{mod.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mod.topics.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">{t}</span>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prossimamente</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
