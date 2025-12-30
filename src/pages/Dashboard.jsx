
import { Shield, TrendingUp, AlertTriangle, CheckCircle, ShieldCheck, Flame, Server, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import AnomalyLogTable from '../components/AnomalyLogTable'
import { useStats } from '../context/StatsContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'


// Custom hook: count up + detect direction (increase/decrease)
function useCountUpWithDirection(target, duration = 800) {
  const [value, setValue] = useState(target)
  const [direction, setDirection] = useState(null) // 'up' | 'down' | null
  const prev = useRef(target)
  const raf = useRef()
  useEffect(() => {
    let start = null
    let from = value
    if (from === target) return
    setDirection(target > prev.current ? 'up' : target < prev.current ? 'down' : null)
    function animate(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.floor(from + (target - from) * progress))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
      else setValue(target)
    }
    raf.current = requestAnimationFrame(animate)
    prev.current = target
    return () => raf.current && cancelAnimationFrame(raf.current)
    // eslint-disable-next-line
  }, [target])
  // Reset direction after animation
  useEffect(() => {
    if (!direction) return
    const timeout = setTimeout(() => setDirection(null), duration)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line
  }, [direction])
  return [value, direction]
}


function Dashboard() {
  const navigate = useNavigate()
  const { stats } = useStats()
  // Use custom hook for animated value + direction
  const [totalThreats, totalThreatsDir] = useCountUpWithDirection(stats.totalThreats)
  const [safeRequests, safeRequestsDir] = useCountUpWithDirection(stats.safeRequests)
  const [avgRiskScore, avgRiskScoreDir] = useCountUpWithDirection(Math.round(stats.avgRiskScore))

  // Tambahkan direction ke setiap stat
  const displayStats = [
    {
      label: 'Total Threats Detected',
      value: totalThreats.toLocaleString(),
      icon: AlertTriangle,
      color: 'from-red-500 to-red-700',
      glow: 'shadow-glow-red',
      bg: 'bg-gradient-to-br from-red-900/60 to-slate-900/80',
      direction: totalThreatsDir,
    },
    {
      label: 'Active Monitoring',
      value: stats.isMonitoring ? 'Live' : 'Idle',
      icon: TrendingUp,
      color: stats.isMonitoring ? 'from-green-500 to-green-700' : 'from-slate-500 to-slate-700',
      glow: stats.isMonitoring ? 'shadow-glow' : '',
      bg: stats.isMonitoring ? 'bg-gradient-to-br from-green-900/60 to-slate-900/80' : 'bg-gradient-to-br from-slate-800/60 to-slate-900/80',
      direction: null,
    },
    {
      label: 'Safe Requests',
      value: safeRequests.toLocaleString(),
      icon: CheckCircle,
      color: 'from-blue-500 to-blue-700',
      glow: 'shadow-glow',
      bg: 'bg-gradient-to-br from-blue-900/60 to-slate-900/80',
      direction: safeRequestsDir,
    },
    {
      label: 'Risk Score',
      value: stats.avgRiskScore > 0 ? `${avgRiskScore}%` : '0%',
      icon: Shield,
      color: 'from-yellow-400 to-yellow-600',
      glow: 'shadow-glow',
      bg: 'bg-gradient-to-br from-yellow-900/60 to-slate-900/80',
      direction: avgRiskScoreDir,
    },
  ]

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight animate-fade-in">Dashboard</h2>
            <p className="text-slate-400 text-lg animate-fade-in delay-100">Static and Real-time operational risk overview</p>
          </div>
          <div className="flex items-center gap-2 animate-fade-in delay-200">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${stats.isMonitoring ? 'bg-green-900/60 text-green-400 border border-green-700' : 'bg-slate-800/60 text-slate-300 border border-slate-700'}`}>{stats.isMonitoring ? 'Live Monitoring' : 'Static Analysis'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon
            // Tampilkan animasi panah hanya saat live monitoring dan ada perubahan
            const showArrow = stats.isMonitoring && stat.direction && ['Total Threats Detected', 'Safe Requests', 'Risk Score'].includes(stat.label)
            // Tentukan warna border pulse sesuai card
            let pulseClass = ''
            if (showArrow && stat.direction === 'up') {
              if (stat.label === 'Total Threats Detected') pulseClass = 'border-pulse-red'
              if (stat.label === 'Safe Requests') pulseClass = 'border-pulse-blue'
              if (stat.label === 'Risk Score') pulseClass = 'border-pulse-yellow'
            } else if (showArrow && stat.direction === 'down') {
              if (stat.label === 'Total Threats Detected') pulseClass = 'border-pulse-red'
              if (stat.label === 'Safe Requests') pulseClass = 'border-pulse-blue'
              if (stat.label === 'Risk Score') pulseClass = 'border-pulse-yellow'
            }
            return (
              <div
                key={index}
                className={`relative ${stat.bg} ${stat.glow} border border-slate-800 rounded-2xl p-7 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-glow-lg active:scale-95 backdrop-blur-md bg-opacity-80 animate-slide-up ${stats.isMonitoring ? 'animate-pulse-slow' : ''} ${pulseClass && showArrow ? pulseClass : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-pertamina-blue/30 to-pertamina-red/20 blur-2xl opacity-60 pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white drop-shadow" />
                  </div>
                  {showArrow && (
                    <span className={`ml-2 flex items-center animate-arrow-bounce ${stat.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}
                      title={stat.direction === 'up' ? 'Naik' : 'Turun'}>
                      {stat.direction === 'up' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    </span>
                  )}
                </div>
                <div className="text-4xl font-extrabold text-white mb-1 group-hover:text-pertamina-blue transition-colors duration-300 tracking-tight">{stat.value}</div>
                <div className="text-base text-slate-300 group-hover:text-white transition-colors duration-300 font-medium mb-1">{stat.label}</div>
                {stat.label === 'Active Monitoring' && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${stats.isMonitoring ? 'bg-green-700/80 text-white' : 'bg-slate-700/80 text-slate-300'}`}>{stat.value}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-800 rounded-2xl p-8 shadow-lg backdrop-blur-md animate-fade-in delay-200">
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-pertamina-blue" /> Welcome to <span className="text-pertamina-blue">ORA-Sentinel</span>
          </h3>
          <p className="text-slate-300 mb-4 text-lg">
            This system monitors operational risks in static and real-time, detecting potential security threats including:
          </p>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-red-500" /> <span className="font-semibold">Data Leakage Detection</span>
            </li>
            <li className="flex items-center gap-3">
              <Server className="w-5 h-5 text-orange-400" /> <span className="font-semibold">Brute Force Attack Detection</span>
            </li>
            <li className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" /> <span className="font-semibold">DDoS Attack Detection</span>
            </li>
          </ul>
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 mt-6">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 rounded-lg bg-pertamina-blue text-white font-semibold shadow hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Go to Upload Analysis
            </button>
            <button
              onClick={() => navigate('/live')}
              className="px-4 py-2 rounded-lg bg-pertamina-red text-white font-semibold shadow hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Go to Live Monitor
            </button>
          </div>
          <div className="mt-6 text-xs text-slate-500 text-right">© {new Date().getFullYear()} ORA-Sentinel</div>
        </div>

        {/* Tabel audit trail anomali & risiko */}
        <AnomalyLogTable />
      </div>
    </>
  )
}

export default Dashboard
