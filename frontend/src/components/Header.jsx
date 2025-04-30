import { Link } from 'react-router'
import { Typography, Box } from '@mui/material'
import AuthButton from './AuthButton'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import UserDropdown from './UserDropdown'

export default function Header() {
	const [isScrolled, setIsScrolled] = useState(false)
	const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<Box
			component="header"
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				zIndex: 50,
				backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
				transition: 'all 0.3s ease-in-out',
				boxShadow: 'none',
			}}
		>
			<Box sx={{ px: { xs: 2, sm: 4 } }}>
				<Box className="flex items-center justify-between py-4">
					<Typography
						variant="h5"
						component={Link}
						to="/"
						sx={{
							fontWeight: 'bold',
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							color: 'primary.main',
							textDecoration: 'none',
						}}
					>
						Sunset Fest Cabo
					</Typography>
					<Box className="flex items-center space-x-4">
						{isAuthenticated ? <UserDropdown /> : <AuthButton />}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
