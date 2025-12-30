import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, AlertCircle } from 'lucide-react'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid username or password')
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pertamina-blue/60 via-slate-900/90 to-blue-900/80 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-pertamina-blue/30 to-blue-700/20 blur-3xl opacity-40" />
        <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-gradient-to-br from-blue-700/30 to-slate-900/10 blur-2xl opacity-30" />
      </div>
      <div className="w-full max-w-md animate-fade-in z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 shadow-glow-lg backdrop-blur-xl transition-all duration-500 hover:shadow-glow-lg hover:border-blue-700">
          <div className="flex flex-col items-center justify-center mb-8 animate-slide-up">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pertamina-blue to-blue-700 rounded-xl shadow-glow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-110 animate-glow-pulse">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white text-center mt-4 tracking-tight drop-shadow animate-fade-in delay-100">ORA-Sentinel</h1>
            <p className="text-base text-slate-400 text-center mt-2 animate-fade-in delay-200">Operational Risk Analyst - Admin Login</p>
          </div>
          {/* Info panel */}
          <div className="mb-6 animate-fade-in delay-200">
            <div className="flex items-center gap-2 justify-center text-xs text-slate-400 bg-slate-800/60 rounded-lg px-4 py-2 shadow-glow-sm">
              <Shield className="w-4 h-4 text-pertamina-blue" />
              <span>Login to access static and real-time risk analysis</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:shadow-glow transition-all duration-300 hover:border-blue-400 placeholder:text-slate-500"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:shadow-glow transition-all duration-300 hover:border-blue-400 placeholder:text-slate-500"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-700/30 to-red-900/30 border border-red-800 rounded-lg animate-slide-up shadow-glow-red">
                <AlertCircle className="w-5 h-5 text-red-400 animate-bounce-gentle" />
                <span className="text-red-300 text-sm font-semibold">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-pertamina-blue to-blue-700 text-white font-bold shadow hover:from-blue-700 hover:to-blue-900 hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 animate-fade-in delay-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-8 text-xs text-slate-400 text-center animate-fade-in delay-300">
            <div className="inline-flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-1">
              <span className="font-semibold text-slate-300">Default:</span>
              <span className="text-pertamina-blue">admin</span>
              <span className="text-slate-300">/</span>
              <span className="text-green-400">pertamina2025</span>
            </div>
            <div className="mt-2 text-slate-500">Use default credentials for demo access.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
