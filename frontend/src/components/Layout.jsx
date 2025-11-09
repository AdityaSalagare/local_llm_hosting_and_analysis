import { Link, useLocation } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, Brain, BarChart3, Moon, Sun } from 'lucide-react'

export default function Layout({ children, isDarkMode, toggleDarkMode }) {
  const location = useLocation()

  const navItems = [
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/intelligence', icon: Brain, label: 'Intelligence' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Chat Portal
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? isDarkMode
                            ? 'border-blue-500 text-blue-400'
                            : 'border-blue-500 text-blue-600'
                          : isDarkMode
                          ? 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-100'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

