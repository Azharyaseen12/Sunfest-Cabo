import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/AuthSlice'
import { useNavigate } from 'react-router'

const UserDropdown = () => {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef(null)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const user = useSelector((state) => state.auth.user)

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleLogout = async () => {
		try {
			await dispatch(logout()).unwrap()
			navigate('/')
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}

	if (!user) return null

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
			>
				<span className="font-medium">{user.first_name || user.username}</span>
				<svg
					className={`w-4 h-4 transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
					<button
						onClick={handleLogout}
						className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					>
						Logout
					</button>
				</div>
			)}
		</div>
	)
}

export default UserDropdown
