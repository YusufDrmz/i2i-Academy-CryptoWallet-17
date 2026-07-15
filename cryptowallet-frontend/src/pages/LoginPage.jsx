import { useState } from 'react'
import api from '../services/api'

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (isRegister) {
        const response = await api.post('/auth/register', { username, email, password })
        // After register, auto login
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
          CryptoWallet
        </h1>
        <h2 className="text-xl text-white mb-6 text-center">
          {isRegister ? 'Register' : 'Login'}
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-green-400"
        />

        {isRegister && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-green-400"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          className="text-gray-400 text-center mt-4 cursor-pointer hover:text-green-400"
        >
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  )
}

export default LoginPage