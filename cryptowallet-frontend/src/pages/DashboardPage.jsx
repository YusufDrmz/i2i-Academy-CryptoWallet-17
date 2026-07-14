import { useState, useEffect } from 'react'
import api from '../services/api'
import ChatPage from './ChatPage'

function DashboardPage({ user, onLogout }) {
  const [prices, setPrices] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [tradeType, setTradeType] = useState('')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeError, setTradeError] = useState('')
  const [tradeLoading, setTradeLoading] = useState(false)

  // Fetch prices on load and every 15 seconds
  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const response = await api.get('/market/prices')
      setPrices(response.data)
    } catch (err) {
      console.error('Failed to fetch prices:', err)
    } finally {
      setLoading(false)
    }
  }

  const openTradeModal = (crypto, type) => {
    setSelectedCrypto(crypto)
    setTradeType(type)
    setTradeAmount('')
    setTradeError('')
  }

  const executeOrder = async () => {
    setTradeLoading(true)
    setTradeError('')
    try {
      await api.post('/trading/execute', {
        asset: selectedCrypto.symbol,
        type: tradeType,
        amount: parseFloat(tradeAmount),
      })
      setSelectedCrypto(null)
      fetchPrices()
    } catch (err) {
      setTradeError(err.response?.data?.message || 'Transaction failed')
    } finally {
      setTradeLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400">CryptoWallet</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Welcome, {user?.username}</span>
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm"
          >
            {showChat ? 'Market' : 'AI Assistant'}
          </button>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Show chat or market view */}
      {showChat ? (
        <ChatPage />
      ) : (
        <div className="p-6">
          {/* Refresh button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Market Prices</h2>
            <button
              onClick={fetchPrices}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Crypto list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((crypto) => (
              <div key={crypto.symbol} className="bg-gray-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">{crypto.symbol}</span>
                  <span className="text-green-400 font-semibold">
                    ${crypto.price?.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openTradeModal(crypto, 'BUY')}
                    className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-lg text-sm font-semibold"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => openTradeModal(crypto, 'SELL')}
                    className="flex-1 bg-red-500 hover:bg-red-600 py-2 rounded-lg text-sm font-semibold"
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade modal */}
      {selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {tradeType === 'BUY' ? 'Buy' : 'Sell'} — {selectedCrypto.symbol}
            </h3>
            <p className="text-gray-400 mb-4">
              Current Price: ${selectedCrypto.price?.toFixed(2)}
            </p>

            {tradeError && (
              <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">
                {tradeError}
              </div>
            )}

            <input
              type="number"
              placeholder="Enter amount"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCrypto(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeOrder}
                disabled={tradeLoading || !tradeAmount}
                className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {tradeLoading ? 'Processing...' : 'Execute Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage