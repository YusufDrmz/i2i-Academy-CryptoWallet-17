import axios from 'axios'

const api = axios.create({
  // baseURL sonundaki '/api' kısmı kaldırıldı.
  // Böylece bileşenlerde api.post('/api/auth/login') yapıldığında adres doğru birleşecek.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api