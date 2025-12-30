import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Upload, Activity, ChevronDown, ChevronRight, Shield, ChevronLeft, Menu, LogOut } from 'lucide-react'
import { useState } from 'react'


function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [monitoringOpen, setMonitoringOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const menuGroups = [
    {
      label: 'Main',
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      label: 'Monitoring',
      icon: Shield,
      open: monitoringOpen,
      setOpen: setMonitoringOpen,
      items: [
        { path: '/upload', icon: Upload, label: 'Upload Analysis' },
        { path: '/live', icon: Activity, label: 'Live Monitor' },
      ],
    },
  ]

  return (
    <aside
      className={`h-full bg-slate-900/80 backdrop-blur border-r border-slate-800 p-4 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && <span className="text-lg font-bold text-white tracking-tight pl-2">Menu</span>}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-2 rounded-lg hover:bg-slate-800/60 transition-colors duration-200 focus:outline-none"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="w-6 h-6 text-slate-300" /> : <ChevronLeft className="w-6 h-6 text-slate-300" />}
        </button>
      </div>
      <nav className="space-y-4 flex-1">
        {menuGroups.map((group, idx) => (
          <div key={group.label} className="">
            {group.label === 'Main' ? (
              group.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                      isActive
                        ? 'bg-pertamina-blue text-white shadow-glow'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:translate-x-1'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                    {collapsed && (
                      <span className="absolute left-full ml-2 bg-slate-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg z-10 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })
            ) : (
              <div>
                <button
                  className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg text-slate-300 font-semibold hover:bg-slate-800/60 transition-all duration-300 group focus:outline-none ${collapsed ? 'justify-center px-2' : ''}`}
                  onClick={() => group.setOpen((v) => !v)}
                  aria-expanded={group.open}
                  disabled={collapsed}
                >
                  <span className="flex items-center gap-2">
                    {group.icon && <group.icon className="w-5 h-5 text-pertamina-blue" />}
                    {!collapsed && group.label}
                  </span>
                  {!collapsed && (
                    <span className="ml-auto">
                      {group.open ? (
                        <ChevronDown className="w-4 h-4 transition-transform duration-300 group-aria-expanded:rotate-180" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform duration-300" />
                      )}
                    </span>
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    group.open && !collapsed ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pl-6 flex flex-col gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.path
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group ${
                            isActive
                              ? 'bg-gradient-to-r from-pertamina-blue/80 to-blue-700/80 text-white shadow-glow'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:translate-x-1'
                          } ${collapsed ? 'justify-center px-2' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                          {!collapsed && <span className="font-medium">{item.label}</span>}
                          {collapsed && (
                            <span className="absolute left-full ml-2 bg-slate-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg z-10 whitespace-nowrap">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
      {/* Logout button at the bottom */}
      <div className={`mt-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow hover:from-red-600 hover:to-red-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 ${collapsed ? '' : 'px-6'}`}
          style={{ width: collapsed ? '48px' : '100%' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
