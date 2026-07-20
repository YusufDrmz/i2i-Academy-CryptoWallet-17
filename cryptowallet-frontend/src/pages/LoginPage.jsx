import { useState } from 'react'
import { Sun, Moon, TrendingUp, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'

function LoginPage({ onLogin, darkMode, setDarkMode }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (isRegister) {
        await api.post('/auth/register', { username, email, password })
        const loginResponse = await api.post('/auth/login', { username, password })
        localStorage.setItem('token', loginResponse.data.token)
        onLogin(loginResponse.data)
      } else {
        const response = await api.post('/auth/login', { username, password })
        localStorage.setItem('token', response.data.token)
        onLogin(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      darkMode ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          darkMode
            ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
        }`}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            CryptoWallet
          </span>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-6 border ${
          darkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {isRegister ? 'Create account' : 'Welcome back'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className={`text-sm font-medium mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-3 rounded-xl outline-none text-sm transition-all ${
                darkMode
                  ? 'bg-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500'
                  : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500'
              }`}
            />
          </div>

          {/* Email (register only) */}
          {isRegister && (
            <div className="mb-4">
              <label className={`text-sm font-medium mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 rounded-xl outline-none text-sm transition-all ${
                  darkMode
                    ? 'bg-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500'
                    : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
            </div>
          )}

          {/* Password */}
          <div className="mb-6">
            <label className={`text-sm font-medium mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className={`w-full p-3 pr-10 rounded-xl outline-none text-sm transition-all ${
                  darkMode
                    ? 'bg-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500'
                    : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50 mb-4"
          >
            {loading ? 'Loading...' : isRegister ? 'Create account' : 'Sign in'}
          </button>

          {/* Toggle */}
          <p
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className={`text-center text-sm cursor-pointer transition-colors ${
              darkMode
                ? 'text-slate-400 hover:text-emerald-400'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage