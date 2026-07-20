import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {user ? (
          <DashboardPage
            user={user}
            onLogout={handleLogout}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        ) : (
          <LoginPage onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
      </div>
    </div>
  )
}

export default App