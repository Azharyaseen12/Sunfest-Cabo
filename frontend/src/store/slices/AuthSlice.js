import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import AuthService from '../../services/authService'
import Cookies from 'js-cookie'

const origin = import.meta.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/'
console.log('Origin:', origin)

// Helper function to set auth data in storage
const setAuthData = (accessToken, refreshToken, user) => {
	// Set in localStorage
	localStorage.setItem('access_token', accessToken)
	localStorage.setItem('refresh_token', refreshToken)
	localStorage.setItem('user', JSON.stringify(user))

	// Set in cookies (for server-side rendering)
	Cookies.set('access_token', accessToken, { expires: 1 }) // 1 day
	Cookies.set('refresh_token', refreshToken, { expires: 7 }) // 7 days
	Cookies.set('user', JSON.stringify(user), { expires: 7 })
}

// Helper function to clear auth data from storage
const clearAuthData = () => {
	localStorage.removeItem('access_token')
	localStorage.removeItem('refresh_token')
	localStorage.removeItem('user')
	Cookies.remove('access_token')
	Cookies.remove('refresh_token')
	Cookies.remove('user')
}

// Login thunk
export const login = createAsyncThunk(
	'auth/login',
	async (credentials, { rejectWithValue }) => {
		try {
			const response = await AuthService.login(credentials)
			setAuthData(response.access, response.refresh, response.user)
			return response
		} catch (error) {
			return rejectWithValue(error.message)
		}
	}
)

// Register thunk
export const register = createAsyncThunk(
	'auth/register',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await AuthService.register(userData)
			return response
		} catch (error) {
			return rejectWithValue(error.message)
		}
	}
)

// Logout thunk
export const logout = createAsyncThunk(
	'auth/logout',
	async (_, { getState, rejectWithValue }) => {
		try {
			const { refreshToken } = getState().auth
			await AuthService.logout(refreshToken)
			clearAuthData()
			return true
		} catch (error) {
			clearAuthData() // Clear data even if logout fails
			return rejectWithValue(error.message)
		}
	}
)

// Check auth status on app load
export const checkAuth = createAsyncThunk(
	'auth/checkAuth',
	async (_, { rejectWithValue }) => {
		try {
			const accessToken = localStorage.getItem('access_token')
			const refreshToken = localStorage.getItem('refresh_token')
			const user = JSON.parse(localStorage.getItem('user'))

			if (accessToken && refreshToken && user) {
				return { accessToken, refreshToken, user }
			}
			return null
		} catch (error) {
			clearAuthData()
			return rejectWithValue(error.message)
		}
	}
)

// Google login thunk
export const googleLogin = createAsyncThunk(
	'auth/googleLogin',
	async (token, { rejectWithValue }) => {
		try {
			const response = await AuthService.handleGoogleLogin(token)
			setAuthData(response.access, null, response.user)
			return response
		} catch (error) {
			return rejectWithValue(error.message)
		}
	}
)

const authSlice = createSlice({
	name: 'auth',
	initialState: {
		user: null,
		accessToken: null,
		refreshToken: null,
		isAuthenticated: false,
		isLoading: false,
		error: null,
	},
	reducers: {
		clearError: (state) => {
			state.error = null
		},
	},
	extraReducers: (builder) => {
		builder
			// Login
			.addCase(login.pending, (state) => {
				state.isLoading = true
				state.error = null
			})
			.addCase(login.fulfilled, (state, action) => {
				state.isLoading = false
				state.isAuthenticated = true
				state.user = action.payload.user
				state.accessToken = action.payload.access
				state.refreshToken = action.payload.refresh
			})
			.addCase(login.rejected, (state, action) => {
				state.isLoading = false
				state.error = action.payload
			})
			// Register
			.addCase(register.pending, (state) => {
				state.isLoading = true
				state.error = null
			})
			.addCase(register.fulfilled, (state) => {
				state.isLoading = false
			})
			.addCase(register.rejected, (state, action) => {
				state.isLoading = false
				state.error = action.payload
			})
			// Logout
			.addCase(logout.fulfilled, (state) => {
				state.isAuthenticated = false
				state.user = null
				state.accessToken = null
				state.refreshToken = null
			})
			// Check Auth
			.addCase(checkAuth.fulfilled, (state, action) => {
				if (action.payload) {
					state.isAuthenticated = true
					state.user = action.payload.user
					state.accessToken = action.payload.accessToken
					state.refreshToken = action.payload.refreshToken
				}
			})
			// Google Login
			.addCase(googleLogin.pending, (state) => {
				state.isLoading = true
				state.error = null
			})
			.addCase(googleLogin.fulfilled, (state, action) => {
				state.isLoading = false
				state.isAuthenticated = true
				state.user = action.payload.user
				state.accessToken = action.payload.access
				state.refreshToken = null // Google login doesn't use refresh token
			})
			.addCase(googleLogin.rejected, (state, action) => {
				state.isLoading = false
				state.error = action.payload
			})
	},
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
