import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, RefreshCw, TrendingUp, TrendingDown, LogOut, Bot, X, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import ChatPage from './ChatPage'

// Crypto icon colors
const CRYPTO_COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  BNB: '#F3BA2F',
  ADA: '#0033AD',
  XRP: '#00AAE4',
  DOGE: '#C2A633',
  DOT: '#E6007A',
  AVAX: '#E84142',
  MATIC: '#8247E5',
}

const CRYPTO_NAMES = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  BNB: 'BNB',
  ADA: 'Cardano',
  XRP: 'XRP',
  DOGE: 'Dogecoin',
  DOT: 'Polkadot',
  AVAX: 'Avalanche',
  MATIC: 'Polygon',
}

function CryptoCard({ crypto, holding, onBuy, onSell, darkMode }) {
  const [history, setHistory] = useState([])
  const color = CRYPTO_COLORS[crypto.symbol] || '#6366f1'
  const isUp = history.length >= 2
    ? history[history.length - 1].price >= history[0].price
    : true

  // Track price history for chart (last 20 data points)
  useEffect(() => {
    setHistory(prev => {
      const next = [...prev, { time: new Date().toLocaleTimeString(), price: crypto.price }]
      return next.slice(-20)
    })
  }, [crypto.price])

  const change = history.length >= 2
    ? ((history[history.length - 1].price - history[0].price) / history[0].price * 100).toFixed(2)
    : '0.00'

  return (
    <div className={`rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg ${
      darkMode
        ? 'bg-slate-800 border-slate-700 hover:border-slate-500'
        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: color }}>
            {crypto.symbol.slice(0, 2)}
          </div>
          <div>
            <div className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {crypto.symbol}
            </div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {CRYPTO_NAMES[crypto.symbol] || crypto.symbol}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            ${crypto.price < 1 ? crypto.price.toFixed(4) : crypto.price.toFixed(2)}
          </div>
          <div className={`text-xs flex items-center justify-end gap-1 ${
            isUp ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}%
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-16 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
            />
            <Tooltip
              contentStyle={{
                background: darkMode ? '#1e293b' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '11px',
                color: darkMode ? '#fff' : '#0f172a',
              }}
              formatter={(val) => [`$${val.toFixed(2)}`, '']}
              labelFormatter={() => ''}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Holdings */}
      {holding && Number(holding) > 0 && (
        <div className={`text-xs mb-3 px-2 py-1 rounded-lg ${
          darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
        }`}>
          Holdings: {Number(holding).toFixed(6)} {crypto.symbol}
          <span className={`ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            ≈ ${(Number(holding) * crypto.price).toFixed(2)}
          </span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onBuy(crypto)}
          className="flex-1 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
        >
          Buy
        </button>
        <button
          onClick={() => onSell(crypto)}
          className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          Sell
        </button>
      </div>
    </div>
  )
}

function DashboardPage({ user, onLogout, darkMode, setDarkMode }) {
  const [prices, setPrices] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [cryptoBalances, setCryptoBalances] = useState({})
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [tradeType, setTradeType] = useState('')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeError, setTradeError] = useState('')
  const [tradeLoading, setTradeLoading] = useState(false)

  useEffect(() => {
    fetchPrices()
    fetchUserBalance()
    const interval = setInterval(() => {
      fetchPrices()
      fetchUserBalance()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchUserBalance = async () => {
    try {
      const response = await api.get('/auth/me')
      setUserBalance(response.data.balance)
      const balancesResponse = await api.get('/auth/balances')
      const cryptoMap = {}
      balancesResponse.data.forEach(b => {
        if (b.currency !== 'USD') cryptoMap[b.currency] = b.amount
      })
      setCryptoBalances(cryptoMap)
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    }
  }

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const response = await api.get('/market/prices')
      const pricesArray = Object.entries(response.data).map(([symbol, price]) => ({
        symbol,
        price: Number(price),
      }))
      // Sort by market cap order
      const order = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOGE', 'DOT', 'MATIC']
      pricesArray.sort((a, b) => order.indexOf(a.symbol) - order.indexOf(b.symbol))
      setPrices(pricesArray)
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
      const endpoint = tradeType === 'BUY' ? '/trading/buy' : '/trading/sell'
      await api.post(endpoint, {
        asset: selectedCrypto.symbol,
        amount: parseFloat(tradeAmount),
      })
      setSelectedCrypto(null)
      fetchPrices()
      fetchUserBalance()
    } catch (err) {
      setTradeError(err.response?.data?.message || 'Transaction failed')
    } finally {
      setTradeLoading(false)
    }
  }

  // Calculate total portfolio value
  const totalCryptoValue = prices.reduce((sum, crypto) => {
    const holding = cryptoBalances[crypto.symbol]
    return sum + (holding ? Number(holding) * crypto.price : 0)
  }, 0)
  const totalPortfolio = Number(userBalance) + totalCryptoValue

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* Header */}
      <header className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between backdrop-blur-sm ${
        darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">CryptoWallet</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Portfolio summary */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>USD Balance</div>
              <div className="font-semibold text-emerald-500">${Number(userBalance).toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Portfolio</div>
              <div className="font-semibold">${totalPortfolio.toFixed(2)}</div>
            </div>
          </div>

          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {user?.username}
          </div>

          {/* AI Button */}
          <button
            onClick={() => setShowChat(true)}
            className="w-9 h-9 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-colors"
            title="AI Assistant"
          >
            <Bot size={18} className="text-white" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-6 max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Market</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Live prices · Updates every 15s
            </p>
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            } disabled:opacity-50`}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Crypto grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {prices.map((crypto) => (
            <CryptoCard
              key={crypto.symbol}
              crypto={crypto}
              holding={cryptoBalances[crypto.symbol]}
              onBuy={(c) => openTradeModal(c, 'BUY')}
              onSell={(c) => openTradeModal(c, 'SELL')}
              darkMode={darkMode}
            />
          ))}
        </div>
      </main>

      {/* AI Chat Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowChat(false)}
          />
          <div className={`relative w-full sm:w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
            darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPage darkMode={darkMode} />
            </div>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {selectedCrypto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedCrypto(null)}
          />
          <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: CRYPTO_COLORS[selectedCrypto.symbol] || '#6366f1' }}
              >
                {selectedCrypto.symbol.slice(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {tradeType === 'BUY' ? 'Buy' : 'Sell'} {selectedCrypto.symbol}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ${selectedCrypto.price.toFixed(2)} per coin
                </p>
              </div>
            </div>

            {tradeError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl mb-4 text-sm">
                {tradeError}
              </div>
            )}

            <div className="mb-4">
              <label className={`text-sm font-medium mb-2 block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Amount ({tradeType === 'BUY' ? 'USD' : selectedCrypto.symbol})
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className={`w-full p-3 rounded-xl outline-none text-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-slate-700 text-white focus:ring-2 focus:ring-indigo-500'
                    : 'bg-slate-100 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                }`}
              />
              {tradeAmount && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ≈ ${(parseFloat(tradeAmount) * selectedCrypto.price).toFixed(2)} total
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCrypto(null)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={executeOrder}
                disabled={tradeLoading || !tradeAmount}
                className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 ${
                  tradeType === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {tradeLoading ? 'Processing...' : `Execute ${tradeType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage