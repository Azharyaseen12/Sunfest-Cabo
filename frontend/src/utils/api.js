import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL + 'api/'

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Add token to requests if it exists
api.interceptors.request.use((config) => {
	const token = Cookies.get('accessToken')
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// If error is 401 and we haven't tried to refresh token yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				const refreshToken = Cookies.get('refreshToken')
				if (!refreshToken) {
					throw new Error('No refresh token')
				}

				const response = await axios.post(`${API_URL}/auth/refresh/`, {
					refresh: refreshToken,
				})

				const { access } = response.data
				Cookies.set('accessToken', access)

				// Retry the original request with new token
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${access}`
				}
				return api(originalRequest)
			} catch (refreshError) {
				// If refresh fails, clear tokens
				Cookies.remove('accessToken')
				Cookies.remove('refreshToken')
				// Don't redirect here, let the component handle it
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)

export default api
