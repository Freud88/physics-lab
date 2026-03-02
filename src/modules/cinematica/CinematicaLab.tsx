import { useState } from 'react'
import MRU from './MRU'
import MRUA from './MRUA'
import MCU from './MCU'

type Tab = 'MRU' | 'MRUA' | 'MCU'

const tabs: { id: Tab; label: string; description: string }[] = [
  { id: 'MRU', label: 'MRU', description: 'Moto Rettilineo Uniforme' },
  { id: 'MRUA', label: 'MRUA', description: 'Moto Rettilineo Uniformemente Accelerato' },
  { id: 'MCU', label: 'MCU', description: 'Moto Circolare Uniforme' },
]

export default function CinematicaLab() {
  const [activeTab, setActiveTab] = useState<Tab>('MRU')

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Tab bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 flex-shrink-0">
        <div className="flex items-end gap-1 pt-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border border-b-0 ${
                activeTab === tab.id
                  ? 'bg-slate-950 border-slate-700 text-sky-400'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="ml-2 text-xs text-slate-500 font-normal hidden sm:inline">
                  {tab.description}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content — fills remaining height */}
      <div className="flex-1 min-h-0">
        {activeTab === 'MRU' && <MRU />}
        {activeTab === 'MRUA' && <MRUA />}
        {activeTab === 'MCU' && <MCU />}
      </div>
    </div>
  )
}
