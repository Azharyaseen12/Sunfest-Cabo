import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { googleLogin } from '../store/slices/AuthSlice'
import { toast } from 'react-toastify'

const FacebookAuthHandler = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const handleGoogleAuth = async () => {
			try {
				// Get token from URL
				const urlParams = new URLSearchParams(window.location.search)
				const token = urlParams.get('token')

				if (!token) {
					setError('No authentication token found')
					toast.error('Authentication failed: No token found')
					navigate('/signin')
					return
				}

				// Dispatch Google login action
				const response = await dispatch(googleLogin(token)).unwrap()
				console.log('Facebook login successful:', response)

				// Remove token from URL
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				)

				// Show success message
				toast.success('Successfully logged in with Facebook')

				// Redirect to home or dashboard
				navigate('/')
			} catch (error) {
				console.error('Facebook login failed:', error)
				setError(error.message || 'Authentication failed')
				toast.error(error.message || 'Failed to authenticate with Facebook')
				navigate('/signin')
			} finally {
				setIsLoading(false)
			}
		}

		handleGoogleAuth()
	}, [dispatch, navigate])

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-4 text-red-600">
						Authentication Error
					</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => navigate('/signin')}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Return to Login
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h2 className="text-2xl font-semibold mb-4">
					{isLoading ? 'Processing Google Login...' : 'Redirecting...'}
				</h2>
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
			</div>
		</div>
	)
}

export default FacebookAuthHandler
