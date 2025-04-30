import axios from 'axios'
import { toast } from 'react-toastify'

const origin = import.meta.env.VITE_API_URL

class AuthService {
	static async register(userData) {
		try {
			const response = await axios.post(
				`${origin}api/accounts/register/`,
				userData
			)
			if (response.status === 201) {
				toast.success(
					'Registration successful! Please check your email to verify your account.'
				)
				return response.data
			}
		} catch (error) {
			if (error.response) {
				const errorData = error.response.data
				let errorMessage = 'Registration failed. '

				if (errorData.username) {
					errorMessage += errorData.username[0] + ' '
				}
				if (errorData.email) {
					errorMessage += errorData.email[0]
				}

				toast.error(errorMessage.trim())
				throw new Error(errorMessage.trim())
			} else {
				toast.error('An unexpected error occurred. Please try again.')
				throw new Error('Network error')
			}
		}
	}

	static async login(credentials) {
		try {
			const response = await axios.post(
				`${origin}api/accounts/login/`,
				credentials
			)
			if (response.status === 200) {
				const { access, refresh, user } = response.data
				toast.success('Login successful!')
				return { access, refresh, user }
			}
		} catch (error) {
			if (error.response) {
				const errorMessage =
					error.response.data.detail || 'Invalid credentials. Please try again.'
				toast.error(errorMessage)
				throw new Error(errorMessage)
			} else {
				toast.error('An unexpected error occurred. Please try again.')
				throw new Error('Network error')
			}
		}
	}

	static async logout(refreshToken) {
		try {
			await axios.post(
				`${origin}api/accounts/logout/`,
				{ refresh: refreshToken },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('access_token')}`,
					},
				}
			)
			return true
		} catch (error) {
			console.error('Logout error:', error)
			return false
		}
	}

	static async refreshToken(refreshToken) {
		try {
			const response = await axios.post(
				`${origin}api/accounts/token/refresh/`,
				{
					refresh: refreshToken,
				}
			)
			return response.data.access
		} catch (error) {
			console.error('Token refresh error:', error)
			return null
		}
	}

	static async handleGoogleLogin(token) {
		try {
			// Get user data using the token
			const response = await axios.get(`${origin}api/accounts/user/`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (response.status === 200) {
				// Store the token and user data
				const user = response.data
				return { access: token, user }
			}
		} catch (error) {
			if (error.response) {
				const errorMessage =
					error.response.data.detail || 'Google login failed. Please try again.'
				toast.error(errorMessage)
				throw new Error(errorMessage)
			} else {
				toast.error('An unexpected error occurred. Please try again.')
				throw new Error('Network error')
			}
		}
	}
}

export default AuthService
