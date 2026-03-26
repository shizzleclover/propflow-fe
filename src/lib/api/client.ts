import axios from 'axios'
import { clearAccessToken, getAccessToken } from '@/lib/auth/token-storage'

function normalizeApiBaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, '')
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const rawBase = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:4000'

export const api = axios.create({
  baseURL: normalizeApiBaseUrl(rawBase),
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAccessToken()
    }
    return Promise.reject(error)
  },
)

