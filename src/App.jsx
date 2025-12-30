import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import UploadAnalysis from './pages/UploadAnalysis'
import LiveMonitor from './pages/LiveMonitor'
import Login from './pages/Login'


import { StatsProvider } from './context/StatsContext'
import { LiveLogProvider } from './context/LiveLogContext'
import { UploadAnalysisProvider } from './context/UploadAnalysisContext'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <StatsProvider>
      <LiveLogProvider>
        <UploadAnalysisProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex h-screen bg-slate-950 text-slate-200">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Header />
                        <main className="flex-1 overflow-y-auto p-6">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/upload" element={<UploadAnalysis />} />
                            <Route path="/live" element={<LiveMonitor />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </UploadAnalysisProvider>
      </LiveLogProvider>
    </StatsProvider>
  )
}

export default App
