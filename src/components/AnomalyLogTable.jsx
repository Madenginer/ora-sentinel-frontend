import { useEffect, useState } from 'react';
import { ShieldCheck, Flame, AlertTriangle } from 'lucide-react';

export default function AnomalyLogTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/anomaly_logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch anomaly logs');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-pertamina-blue" /> Anomaly & Risk Audit Trail
      </h3>
      {loading ? (
        <div className="text-slate-400">Loading anomaly logs...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-slate-400">No anomaly detected.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <table className="min-w-full text-sm text-slate-200">
            <thead>
              <tr className="bg-slate-800 text-slate-300">
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Risk Level</th>
                <th className="px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/60 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-3 py-2">{log.ip}</td>
                  <td className="px-3 py-2">{log.url}</td>
                  <td className="px-3 py-2 flex items-center gap-1">
                    {log.label.includes('Leakage') && <Flame className="w-4 h-4 text-red-500" title="Data Leakage" />}
                    {log.label.includes('Brute') && <AlertTriangle className="w-4 h-4 text-orange-400" title="Brute Force" />}
                    {log.label.includes('DDoS') && <AlertTriangle className="w-4 h-4 text-yellow-400" title="DDoS" />}
                    <span>{log.label}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${
                      log.risk_level === 'high'
                        ? 'bg-red-700/80 text-red-200'
                        : log.risk_level === 'medium'
                        ? 'bg-yellow-700/80 text-yellow-200'
                        : 'bg-green-700/80 text-green-200'
                    }`}>
                      {log.risk_level}
                    </span>
                  </td>
                  <td className="px-3 py-2">{log.risk_score?.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
