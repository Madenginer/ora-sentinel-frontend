
import { Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'


function Header() {
  const navigate = useNavigate()

  // Realtime clock state
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Format date/time
  const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <header className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur border-b border-slate-800 px-8 py-5 shadow-glow animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pertamina-blue to-blue-700 shadow-glow-lg animate-fade-in">
            <Shield className="w-7 h-7 text-white drop-shadow" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-pertamina-blue/30 to-blue-700/20 blur-xl opacity-60 pointer-events-none" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight animate-fade-in delay-100">ORA-Sentinel</h1>
            <p className="text-sm md:text-base text-slate-400 animate-fade-in delay-200">Pertamina Operational Risk Monitoring</p>
          </div>
        </div>
        {/* Realtime clock */}
        <div className="flex flex-col items-end gap-1 min-w-[180px] animate-fade-in delay-200">
          <span className="text-lg font-mono font-bold text-blue-400 drop-shadow tracking-widest animate-pulse-slow">{time}</span>
          <span className="text-xs text-slate-400 font-mono tracking-wide">{day}</span>
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-pertamina-blue/30 via-slate-700/60 to-blue-700/30 animate-fade-in delay-300" />
    </header>
  )
}

export default Header
