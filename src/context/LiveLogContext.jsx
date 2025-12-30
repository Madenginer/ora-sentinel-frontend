
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useStats } from './StatsContext'

const LiveLogContext = createContext()

export function LiveLogProvider({ children }) {
  const [logs, setLogs] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [alert, setAlert] = useState(null)
  const wsRef = useRef(null)
  const [lastMessageAt, setLastMessageAt] = useState(null)
  const [isManuallyConnected, setIsManuallyConnected] = useState(false)
  const { updateFromLiveLog, resetStats } = useStats()

  // Manual connect/disconnect logic
  const connectWebSocket = () => {
    setLogs([])
    resetStats()
    setIsManuallyConnected(true)
  }
  const disconnectWebSocket = () => {
    setIsManuallyConnected(false)
    setLogs([])
    resetStats()
    if (wsRef.current) wsRef.current.close()
  }

  useEffect(() => {
    if (!isManuallyConnected) {
      setIsConnected(false)
      return
    }
    const token = localStorage.getItem('token')
    if (!token) return
    let ws
    ws = new window.WebSocket(`ws://localhost:8000/ws/live?token=${token}`)
    wsRef.current = ws
    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => ws.close()
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setLastMessageAt(Date.now())
      setLogs((prev) => [data, ...prev].slice(0, 50))
      updateFromLiveLog(data)
      if (data.label && (data.label.includes('Data Leakage') || data.label.includes('Brute Force') || data.label.includes('DDoS'))) {
        setAlert(data)
        setTimeout(() => setAlert(null), 5000)
      }
    }
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [isManuallyConnected, updateFromLiveLog])

  return (
    <LiveLogContext.Provider value={{ logs, isConnected, alert, lastMessageAt, isManuallyConnected, connectWebSocket, disconnectWebSocket }}>
      {children}
    </LiveLogContext.Provider>
  )
}

export function useLiveLog() {
  const ctx = useContext(LiveLogContext)
  if (!ctx) throw new Error('useLiveLog must be used within LiveLogProvider')
  return ctx
}
