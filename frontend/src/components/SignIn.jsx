import { useState } from 'react'
import { FaGoogle, FaFacebook, FaApple, FaTimes } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { login } from '../store/slices/AuthSlice'
import {onGoogleLoginSuccess} from './Google'
import {onFacebookLoginSuccess} from './Google'
const SignIn = ({ onClose, onSignUpClick }) => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const [errors, setErrors] = useState({})
	const [isLoading, setIsLoading] = useState(false)
	const dispatch = useDispatch()

	const validateForm = () => {
		const newErrors = {}

		// Email validation
		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email'
		}

		// Password validation
		if (!formData.password) {
			newErrors.password = 'Password is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!validateForm()) return

		setIsLoading(true)
		try {
			const result = await dispatch(login(formData)).unwrap()
			if (result) {
				// Wait a moment to show the success message before closing
				setTimeout(() => {
					onClose()
				}, 1000)
			}
		} catch (error) {
			// Error is already handled by the auth service
			console.error('Login error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleOAuthSignIn = (provider) => {
		// Implement OAuth sign-in logic here
		console.log(`Signing in with ${provider}...`)
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center z-[100]">
			<div className="bg-[#79797999] backdrop-blur-sm rounded-lg p-8 max-w-md w-full relative">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-white hover:text-gray-700"
				>
					<FaTimes />
				</button>

				<h2 className="text-2xl font-bold mb-6 text-white">Sign in</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<input
							type="email"
							placeholder="Email"
							className={`w-full p-3 border rounded ${errors.email ? 'border-red-500' : 'border-[#F821DB]'
								}`}
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
						/>
						{errors.email && (
							<p className="text-red-500 text-sm mt-1">{errors.email}</p>
						)}
					</div>

					<div>
						<input
							type="password"
							placeholder="Password"
							className={`w-full p-3 border rounded ${errors.password ? 'border-red-500' : 'border-[#F821DB]'
								}`}
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
						/>
						{errors.password && (
							<p className="text-red-500 text-sm mt-1">{errors.password}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-[#F821DB] text-white p-3 rounded hover:bg-[#c000a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				<div className="mt-4 text-right">
					<a href="#" className="text-[#F821DB] font-bold hover:underline">
						Forgot Password
					</a>
				</div>

				<div className="mt-2">
					<div className="relative">
						<div className="relative flex justify-center text-sm">
							<span className="px-2 text-white">or</span>
						</div>
					</div>

					<div className="mt-6 grid grid-cols-3 gap-3">
						<button
							onClick={onGoogleLoginSuccess}
							className="h-10 flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							<FaGoogle className="text-lg" />
						</button>
						<button
							onClick={onFacebookLoginSuccess}
							className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							
							<FaFacebook className="text-blue-600 text-lg" />
						</button>
						<button
							onClick={() => handleOAuthSignIn('Apple')}
							className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							<FaApple className="text-lg" />
						</button>
					</div>
				</div>

				<div className="mt-6 text-center">
					<p className="text-sm text-white">
						Don't have an account?{' '}
						<button
							onClick={onSignUpClick}
							className="text-[#F821DB] font-bold hover:underline"
						>
							Sign Up
						</button>
					</p>
				</div>
			</div>
		</div>
	)
}

export default SignIn
