import { createContext, useContext, useState } from 'react'

const StatsContext = createContext()

export function StatsProvider({ children }) {
  const [stats, setStats] = useState({
    totalThreats: 0,
    safeRequests: 0,
    totalRequests: 0,
    avgRiskScore: 0,
    isMonitoring: false,
  })

  const updateFromLiveLog = (log) => {
    setStats((prev) => {
      const isThreat = !log.label.includes('Safe')
      const newTotalRequests = prev.totalRequests + 1
      const newThreats = isThreat ? prev.totalThreats + 1 : prev.totalThreats
      const newSafe = !isThreat ? prev.safeRequests + 1 : prev.safeRequests
      
      const currentSum = prev.avgRiskScore * prev.totalRequests
      const newAvg = newTotalRequests > 0 
        ? (currentSum + Math.abs(log.risk_score * 100)) / newTotalRequests 
        : 0

      return {
        totalThreats: newThreats,
        safeRequests: newSafe,
        totalRequests: newTotalRequests,
        avgRiskScore: newAvg,
        isMonitoring: true,
      }
    })
  }

  const updateFromCSV = (results) => {
    const threats = results.filter((r) => !r.label.includes('Safe')).length
    const safe = results.filter((r) => r.label.includes('Safe')).length
    const total = results.length
    const avgRisk = total > 0 
      ? results.reduce((sum, r) => sum + Math.abs(r.risk_score * 100), 0) / total 
      : 0

    setStats({
      totalThreats: threats,
      safeRequests: safe,
      totalRequests: total,
      avgRiskScore: avgRisk,
      isMonitoring: false,
    })
  }

  const resetStats = () => {
    setStats({
      totalThreats: 0,
      safeRequests: 0,
      totalRequests: 0,
      avgRiskScore: 0,
      isMonitoring: false,
    })
  }

  return (
    <StatsContext.Provider value={{ stats, updateFromLiveLog, updateFromCSV, resetStats }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStats must be used within StatsProvider')
  }
  return context
}
