import { useState } from 'react'
import { FaGoogle, FaFacebook, FaApple, FaTimes } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { register } from '../store/slices/AuthSlice'

const SignUp = ({ onClose, onSignInClick }) => {
	const [formData, setFormData] = useState({
		first_name: '',
		email: '',
		password: '',
	})
	const [errors, setErrors] = useState({})
	const [isLoading, setIsLoading] = useState(false)
	const dispatch = useDispatch()

	const validatePassword = (password) => {
		const minLength = 8
		const hasUpperCase = /[A-Z]/.test(password)
		const hasLowerCase = /[a-z]/.test(password)
		const hasNumbers = /\d/.test(password)
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

		const errors = []
		if (password.length < minLength) errors.push('at least 8 characters')
		if (!hasUpperCase) errors.push('an uppercase letter')
		if (!hasLowerCase) errors.push('a lowercase letter')
		if (!hasNumbers) errors.push('a number')
		if (!hasSpecialChar) errors.push('a special character')

		return {
			isValid: errors.length === 0,
			errors:
				errors.length > 0 ? `Password must contain ${errors.join(', ')}` : '',
			strength: Math.min(
				5,
				[hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean)
					.length + (password.length >= minLength ? 1 : 0)
			),
		}
	}

	const validateForm = () => {
		const newErrors = {}

		// Name validation
		if (!formData.first_name.trim()) {
			newErrors.first_name = 'Name is required'
		}

		// Email validation
		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email'
		}

		// Password validation
		const passwordValidation = validatePassword(formData.password)
		if (!passwordValidation.isValid) {
			newErrors.password = passwordValidation.errors
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!validateForm()) return

		setIsLoading(true)
		try {
			const updatedRegistrationData = {
				...formData,
				username: formData.email,
			}
			await dispatch(register(updatedRegistrationData)).unwrap()
			onClose()
		} catch (error) {
			console.error('Registration error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleOAuthSignUp = (provider) => {
		console.log(`Signing up with ${provider}...`)
	}

	const getPasswordStrengthColor = (strength) => {
		const colors = [
			'bg-red-500',
			'bg-orange-500',
			'bg-yellow-500',
			'bg-blue-500',
			'bg-green-500',
		]
		return colors[strength - 1] || colors[0]
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

				<h2 className="text-2xl font-bold mb-6 text-white">Sign Up</h2>

				<div className="mb-2 grid grid-cols-3 gap-3">
					<button
						onClick={() => handleOAuthSignUp('Google')}
						className="h-10 flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
					>
						<FaGoogle className="text-lg" />
					</button>
					<button
						onClick={() => handleOAuthSignUp('Facebook')}
						className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
					>
						<FaFacebook className="text-blue-600 text-lg" />
					</button>
					<button
						onClick={() => handleOAuthSignUp('Apple')}
						className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
					>
						<FaApple className="text-lg" />
					</button>
				</div>

				<div className="relative mb-2">
					<div className="relative flex justify-center text-sm">
						<span className="px-2 text-white">or</span>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<input
							type="text"
							placeholder="Name"
							className={`w-full p-3 border rounded ${
								errors.first_name ? 'border-red-500' : 'border-[#F821DB]'
							}`}
							value={formData.first_name}
							onChange={(e) =>
								setFormData({ ...formData, first_name: e.target.value })
							}
						/>
						{errors.first_name && (
							<p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
						)}
					</div>

					<div>
						<input
							type="email"
							placeholder="Email"
							className={`w-full p-3 border rounded ${
								errors.email ? 'border-red-500' : 'border-[#F821DB]'
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
							className={`w-full p-3 border rounded ${
								errors.password ? 'border-red-500' : 'border-[#F821DB]'
							}`}
							value={formData.password}
							onChange={(e) => {
								const newPassword = e.target.value
								setFormData({ ...formData, password: newPassword })
								validatePassword(newPassword)
							}}
						/>
						{formData.password && (
							<div className="mt-2">
								<div className="h-2 flex gap-1">
									{[1, 2, 3, 4, 5].map((level) => (
										<div
											key={level}
											className={`h-full w-full rounded ${
												level <= validatePassword(formData.password).strength
													? getPasswordStrengthColor(
															validatePassword(formData.password).strength
													  )
													: 'bg-gray-200'
											}`}
										/>
									))}
								</div>
								{errors.password && (
									<p className="text-red-500 text-sm mt-1">{errors.password}</p>
								)}
							</div>
						)}
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-[#F821DB] text-white py-3 rounded hover:bg-[#c000a8] transition-colors"
					>
						{isLoading ? 'Signing up...' : 'Sign Up'}
					</button>
				</form>

				<div className="mt-4 text-center">
					<p className="text-white">
						Already have an account?{' '}
						<button
							onClick={onSignInClick}
							className="text-[#F821DB] hover:underline"
						>
							Sign in
						</button>
					</p>
				</div>
			</div>
		</div>
	)
}

export default SignUp
