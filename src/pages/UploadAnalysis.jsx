
import { useState } from 'react'
import { Upload, FileText, AlertCircle, BarChart2, CheckCircle, ShieldAlert, RefreshCw } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { useStats } from '../context/StatsContext'
import { useUploadAnalysis } from '../context/UploadAnalysisContext'

function UploadAnalysis() {
  const { file, setFile, results, setResults, loading, setLoading, error, setError, resetUpload } = useUploadAnalysis()
  const [dragActive, setDragActive] = useState(false)
  const { updateFromCSV } = useStats()
  const [topN, setTopN] = useState(50)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setResults([])

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/analyze_csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze file')
      }

      const data = await response.json()
      setResults(data)
      
      // Update global stats context from CSV results
      updateFromCSV(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (label) => {
    if (label.includes('Data Leakage')) return 'text-red-500'
    if (label.includes('Brute Force')) return 'text-orange-500'
    if (label.includes('DDoS')) return 'text-yellow-500'
    return 'text-green-500'
  }

  const colorFromError = (er) => {
    const t = Math.max(0, Math.min(1, er / 100))
    const r0 = 34, g0 = 197, b0 = 94   // #22c55e (green)
    const r1 = 239, g1 = 68, b1 = 68   // #ef4444 (red)
    const r = Math.round(r0 + (r1 - r0) * t)
    const g = Math.round(g0 + (g1 - g0) * t)
    const b = Math.round(b0 + (b1 - b0) * t)
    return `rgb(${r}, ${g}, ${b})`
  }

  const chartData = results.map((item) => {
    const errorRate = item.error_rate
    return {
      name: item.ip,
      requests: item.request_count,
      errorRate,
      responseSize: item.response_size / 1000,
      risk: Math.abs(item.risk_score * 100),
      color: colorFromError(errorRate),
    }
  })

  const sortedByError = [...results].sort((a, b) => b.error_rate - a.error_rate)
  let previewRows = []
  if (topN === 'all') {
    // urutkan sesuai urutan asli (timestamp/data asli)
    previewRows = [...results]
  } else {
    previewRows = sortedByError.slice(0, topN)
  }

  const exportTopN = () => {
    if (!previewRows.length) return
    const headers = ["timestamp", "ip", "url", "request_count", "error_rate", "response_size", "label", "risk_score"]
    const rows = previewRows.map((row) => headers.map((h) => row[h]))
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const nameSuffix = topN === 'all' ? 'all' : topN
    link.setAttribute("download", `top_${nameSuffix}_error_rate.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  // Stats summary
  const total = results.length
  const totalThreats = results.filter(r => !r.label.includes('Safe')).length
  const totalSafe = results.filter(r => r.label.includes('Safe')).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 animate-fade-in">
        <div className="flex items-center gap-4">
          <BarChart2 className="w-10 h-10 text-pertamina-blue drop-shadow" />
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Upload Analysis</h2>
            <p className="text-slate-400 text-lg">Analyze historical risk data from your CSV logs</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow hover:from-red-600 hover:to-red-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={resetUpload}
          disabled={loading && !file}
        >
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Upload Card */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-800 rounded-2xl p-10 shadow-lg backdrop-blur-md animate-fade-in delay-100">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-pertamina-blue bg-slate-800/50 shadow-glow scale-105'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/20'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-14 h-14 mx-auto mb-4 text-pertamina-blue transition-all duration-300 group-hover:scale-110" />
          <p className="text-xl text-slate-200 mb-2 font-semibold">
            {file ? file.name : 'Drag & drop your CSV file here'}
          </p>
          <p className="text-sm text-slate-400 mb-4">or</p>
          <label className="inline-block px-8 py-3 bg-pertamina-blue text-white rounded-xl cursor-pointer hover:bg-blue-700 hover:shadow-glow transition-all duration-300 active:scale-95 font-semibold">
            Browse Files
            <input
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
          </label>
          <div className="mt-4 text-xs text-slate-400">Accepted format: .csv &nbsp;|&nbsp; Max size: 5MB</div>
        </div>

        {file && (
          <div className="mt-6 flex items-center gap-3 animate-slide-up">
            <FileText className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 font-medium truncate max-w-xs">{file.name}</span>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="ml-auto px-8 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-900 hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-semibold"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-6 w-full h-2 bg-slate-800 rounded-full overflow-hidden animate-fade-in">
            <div className="h-full bg-gradient-to-r from-pertamina-blue to-blue-700 animate-pulse" style={{ width: '100%' }} />
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-2 p-4 bg-red-900/20 border border-red-800 rounded-lg animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-300 font-medium">{error}</span>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-500 text-center">
          <span className="font-semibold text-pertamina-blue">Tips:</span> File harus berisi kolom: timestamp, ip, url, request_count, error_rate, response_size, label, risk_score.
        </div>
      </div>

      {results.length > 0 && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in delay-200">
            <div className="bg-gradient-to-br from-blue-900/60 to-slate-900/80 border border-blue-800 rounded-2xl p-6 flex flex-col items-center shadow-glow transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-blue-400 active:scale-100 cursor-pointer">
              <BarChart2 className="w-8 h-8 text-pertamina-blue mb-2 transition-all duration-300 group-hover:scale-110" />
              <div className="text-3xl font-extrabold text-white mb-1">{total}</div>
              <div className="text-base text-slate-300 font-medium">Total Records</div>
            </div>
            <div className="bg-gradient-to-br from-red-900/60 to-slate-900/80 border border-red-800 rounded-2xl p-6 flex flex-col items-center shadow-glow transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-red-400 active:scale-100 cursor-pointer">
              <ShieldAlert className="w-8 h-8 text-red-500 mb-2 transition-all duration-300 group-hover:scale-110" />
              <div className="text-3xl font-extrabold text-white mb-1">{totalThreats}</div>
              <div className="text-base text-slate-300 font-medium">Total Threats</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/60 to-slate-900/80 border border-green-800 rounded-2xl p-6 flex flex-col items-center shadow-glow transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-green-400 active:scale-100 cursor-pointer">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2 transition-all duration-300 group-hover:scale-110" />
              <div className="text-3xl font-extrabold text-white mb-1">{totalSafe}</div>
              <div className="text-base text-slate-300 font-medium">Safe Records</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mt-8 animate-fade-in delay-300">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-pertamina-blue" /> Risk Visualization</h3>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="requests"
                  name="Request Count"
                  stroke="#94a3b8"
                  label={{ value: 'Request Count', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                />
                <YAxis
                  dataKey="errorRate"
                  name="Error Rate"
                  stroke="#94a3b8"
                  label={{ value: 'Error Rate', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Scatter name="Risk Data" data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-8 animate-fade-in delay-400">
            <div className="p-6 border-b border-slate-800 flex flex-wrap items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Analysis Results</h3>
                <p className="text-sm text-slate-400 mt-1">Total records: {results.length}</p>
                <p className="text-sm text-slate-400">Preview: {topN === 'all' ? 'All logs (sorted by highest error rate)' : `Top ${topN} by highest error rate`}</p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-slate-300">Top N</label>
                <select
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-3 py-2"
                  value={topN}
                  onChange={(e) => {
                    const val = e.target.value
                    setTopN(val === 'all' ? 'all' : Number(val))
                  }}
                >
                  {[10, 50, 100].map((n) => (
                    <option key={n} value={n}>Top {n}</option>
                  ))}
                  <option value="all">All logs</option>
                </select>
                <button
                  onClick={exportTopN}
                  className="px-4 py-2 bg-gradient-to-r from-pertamina-blue to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 hover:shadow-glow transition-all duration-300 font-semibold"
                >
                  Export {topN === 'all' ? 'All' : `Top ${topN}`}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Requests</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Error Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {previewRows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-mono">{row.ip}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{row.url}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{row.request_count}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{row.error_rate}%</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${getStatusColor(row.label)}`}>{row.label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UploadAnalysis
