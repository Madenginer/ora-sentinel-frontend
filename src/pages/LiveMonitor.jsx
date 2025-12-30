
import { useState } from 'react'
import { Activity, AlertTriangle, X, Zap, Download, ShieldCheck, RefreshCw, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useStats } from '../context/StatsContext'
import { useLiveLog } from '../context/LiveLogContext'


function LiveMonitor() {
  const { logs, isConnected, alert, lastMessageAt, isManuallyConnected, connectWebSocket, disconnectWebSocket } = useLiveLog()
  const [displayCount, setDisplayCount] = useState(50)

  const getStatusColor = (label) => {
    if (label.includes('Data Leakage')) return 'text-red-500'
    if (label.includes('Brute Force')) return 'text-orange-500'
    if (label.includes('DDoS')) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getAlertColor = (label) => {
    if (label.includes('Data Leakage')) return 'bg-red-900/20 border-red-800'
    if (label.includes('Brute Force')) return 'bg-orange-900/20 border-orange-800'
    if (label.includes('DDoS')) return 'bg-yellow-900/20 border-yellow-800'
    return 'bg-green-900/20 border-green-800'
  }

  const chartData = logs.slice(0, 20).reverse().map((log, index) => ({
    index: index + 1,
    requests: log.request_count,
    errorRate: log.error_rate,
    responseSize: log.response_size / 1000,
    riskScore: Math.abs(log.risk_score * 100),
  }))

  const threatCount = logs.filter(log => !log.label.includes('Safe')).length
  const safeCount = logs.filter(log => log.label.includes('Safe')).length

  const displayedLogs = displayCount === 'all' ? logs : logs.slice(0, displayCount)

  const exportLiveLogs = () => {
    if (!displayedLogs.length) return
    const headers = ["timestamp", "ip", "url", "request_count", "error_rate", "response_size", "label", "risk_score"]
    const rows = displayedLogs.map((row) => headers.map((h) => row[h]))
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const nameSuffix = displayCount === 'all' ? 'all' : displayCount
    link.setAttribute("download", `live_logs_latest_${nameSuffix}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  return (
    <div className="space-y-8">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 animate-fade-in">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-pertamina-blue drop-shadow" />
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Live Monitor</h2>
            <p className="text-slate-400 text-lg">Real-time operational risk detection & alerting</p>
          </div>
        </div>
        <div className="flex items-center gap-3 animate-fade-in delay-100">
          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isConnected ? 'bg-green-900/60 text-green-400 border-green-700' : 'bg-slate-800/60 text-slate-300 border-slate-700'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            {isConnected ? 'Live' : 'Idle'}
          </span>
          {isManuallyConnected ? (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold shadow hover:from-red-800 hover:to-red-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={disconnectWebSocket}
              disabled={!isConnected}
            >
              <RefreshCw className="w-4 h-4" /> Disconnect
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-700 to-green-900 text-white font-semibold shadow hover:from-green-800 hover:to-green-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={connectWebSocket}
            >
              <Zap className="w-4 h-4" /> Connect
            </button>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg backdrop-blur-md animate-fade-in delay-100">
        <Zap className="w-7 h-7 text-pertamina-blue" />
        <div className="text-base text-slate-300">
          Jalankan <span className="font-mono text-pertamina-blue font-bold">python backend/log_simulator.py</span> untuk mengaktifkan data stream. Tanpa generator, grafik akan diam (menunggu data dari <span className="font-mono">/ws/live</span>).
          {lastMessageAt && (
            <span className="ml-2 text-xs text-slate-500">Last update: {new Date(lastMessageAt).toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {alert && (
        <div className={`border rounded-lg p-4 ${getAlertColor(alert.label)} animate-pulse`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Security Alert Detected!
                </h3>
                <p className="text-slate-300 mb-2">
                  <strong>{alert.label}</strong>
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                  <div>IP: <span className="text-slate-200 font-mono">{alert.ip}</span></div>
                  <div>URL: <span className="text-slate-200">{alert.url}</span></div>
                  <div>Requests: <span className="text-slate-200">{alert.request_count}</span></div>
                  <div>Error Rate: <span className="text-slate-200">{alert.error_rate}%</span></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in delay-200">
        <div className={`bg-gradient-to-br from-blue-900/60 to-slate-900/80 border border-blue-800 rounded-2xl p-6 flex flex-col items-center shadow-glow transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-blue-400 active:scale-100 cursor-pointer ${isConnected ? 'animate-glow-pulse' : ''}`}>
          <Activity className="w-8 h-8 text-pertamina-blue mb-2 transition-all duration-300 group-hover:scale-110" />
          <div className="text-3xl font-extrabold text-white mb-1">{logs.length}</div>
          <div className="text-base text-slate-300 font-medium">Total Monitored</div>
        </div>
        <div className={`bg-gradient-to-br from-red-900/60 to-slate-900/80 border border-red-800 rounded-2xl p-6 flex flex-col items-center shadow-glow transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-red-400 active:scale-100 cursor-pointer ${isConnected ? 'animate-glow-pulse' : ''}`}>
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2 transition-all duration-300 group-hover:scale-110" />
          <div className="text-3xl font-extrabold text-white mb-1">{threatCount}</div>
          <div className="text-base text-slate-300 font-medium">Threats Detected</div>
        </div>
        <div className={`bg-gradient-to-br from-green-900/60 to-slate-900/80 border border-green-800 rounded-2xl p-6 flex flex-col items-center shadow-glow transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-green-400 active:scale-100 cursor-pointer ${isConnected ? 'animate-glow-pulse' : ''}`}>
          <CheckCircle className="w-8 h-8 text-green-400 mb-2 transition-all duration-300 group-hover:scale-110" />
          <div className="text-3xl font-extrabold text-white mb-1">{safeCount}</div>
          <div className="text-base text-slate-300 font-medium">Safe Requests</div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-fade-in delay-300">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-pertamina-blue" /> Real-time Metrics</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="index"
                stroke="#94a3b8"
                label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#0066CC" name="Requests" />
              <Line type="monotone" dataKey="errorRate" stroke="#f59e0b" name="Error Rate %" />
              <Line type="monotone" dataKey="riskScore" stroke="#ef4444" name="Risk Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in delay-400">
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Live Log Stream</h3>
            <p className="text-sm text-slate-400 mt-1">Last 50 entries (sliding window)</p>
            <p className="text-sm text-slate-400">Preview: {displayCount === 'all' ? 'All latest logs' : `Latest ${displayCount} logs`}</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-slate-300">Show Latest</label>
            <select
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-3 py-2"
              value={displayCount}
              onChange={(e) => {
                const val = e.target.value
                setDisplayCount(val === 'all' ? 'all' : Number(val))
              }}
            >
              {[10, 50, 100].map((n) => (
                <option key={n} value={n}>{n} logs</option>
              ))}
              <option value="all">All logs</option>
            </select>
            <button
              onClick={exportLiveLogs}
              disabled={!displayedLogs.length}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pertamina-blue to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 hover:shadow-glow transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export {displayCount === 'all' ? 'All' : `Latest ${displayCount}`}
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">IP</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">URL</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Requests</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Error %</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayedLogs.map((log, index) => (
                <tr
                  key={index}
                  className={`hover:bg-slate-800/50 transition-colors ${!log.label.includes('Safe') ? 'bg-red-900/10' : ''}`}
                >
                  <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-300 font-mono">{log.ip}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{log.url}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{log.request_count}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{log.error_rate}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-semibold ${getStatusColor(log.label)}`}>{log.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center animate-fade-in delay-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-slate-500 animate-pulse" />
          <p className="text-lg text-slate-400">Waiting for live data...</p>
          <p className="text-sm text-slate-500 mt-2">
            {isConnected ? 'Connected ke WebSocket, menunggu generator mengirim data' : 'Connecting...'}
          </p>
        </div>
      )}
    </div>
  )
}

export default LiveMonitor
