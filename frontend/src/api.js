import axios from 'axios'
import { toast } from 'sonner'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8765',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 502) {
      const message =
        error.response.data?.detail || '系统当前繁忙，请稍后重试'
      toast.error(message)
    }
    return Promise.reject(error)
  }
)
