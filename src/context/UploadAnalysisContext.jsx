
import React, { createContext, useContext, useState } from 'react'
import { useStats } from './StatsContext'

const UploadAnalysisContext = createContext()


export function UploadAnalysisProvider({ children }) {
  const [file, setFile] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { resetStats, stats } = useStats()

  const resetUpload = () => {
    setFile(null)
    setResults([])
    setLoading(false)
    setError(null)
    // Only reset stats if dashboard is showing CSV mode (not live monitor)
    if (stats && stats.isMonitoring === false) {
      resetStats()
    }
  }

  return (
    <UploadAnalysisContext.Provider value={{ file, setFile, results, setResults, loading, setLoading, error, setError, resetUpload }}>
      {children}
    </UploadAnalysisContext.Provider>
  )
}

export function useUploadAnalysis() {
  const ctx = useContext(UploadAnalysisContext)
  if (!ctx) throw new Error('useUploadAnalysis must be used within UploadAnalysisProvider')
  return ctx
}
