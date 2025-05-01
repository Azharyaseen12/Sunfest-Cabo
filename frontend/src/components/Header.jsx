import { Link } from 'react-router'
import { Typography, Box, Divider } from '@mui/material'
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
        backgroundColor: isScrolled ? '#2F2F2F' : 'transparent',
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
          <Box className="flex items-center gap-6"> {/* Increased gap */}
            {/* Navigation links for all users */}
			<Box sx={{ display: 'flex', gap: 4 }}>
			<Typography
				component={Link}
				// to="/"
				sx={{
				color: 'primary.main',
				textDecoration: 'none',
				position: 'relative',
				'&:after': {
					content: '""',
					position: 'absolute',
					width: '100%',
					height: '2px',
					bottom: '-4px',
					left: '0',
					backgroundColor: 'primary.main',
					transform: 'scaleX(1)',
					transformOrigin: 'left center',
					transition: 'transform 0.3s ease',
				},
				'&:hover': {
					color: 'primary.main',
					transition: 'transform 0.3s ease',
				},
				}}
			>
				Home
			</Typography>
			<Typography
				component={Link}
				// to="/events"
				sx={{
				color: 'white',
				textDecoration: 'none',
				position: 'relative',
				'&:hover': {
					color: 'primary.main',
					transition: 'transform 0.3s ease',
				},
				'&:hover:after': {
					transform: 'scaleX(1)',
					transformOrigin: 'left center',
					color: 'primary.main',
				},
				'&:after': {
					content: '""',
					position: 'absolute',
					width: '100%',
					height: '2px',
					bottom: '-4px',
					left: '0',
					backgroundColor: 'primary.main',
					transform: 'scaleX(0)',
					transformOrigin: 'right center',
					transition: 'transform 0.3s ease',
				}
				}}
			>
				Events
			</Typography>
			<Typography
				component={Link}
				// to="/about"
				sx={{
				color: 'white',
				textDecoration: 'none',
				position: 'relative',
				'&:hover': {
					color: 'primary.main',
					transition: 'transform 0.3s ease',
				},
				'&:hover:after': {
					transform: 'scaleX(1)',
					transformOrigin: 'left center',
				},
				'&:after': {
					content: '""',
					position: 'absolute',
					width: '100%',
					height: '2px',
					bottom: '-4px',
					left: '0',
					backgroundColor: 'primary.main',
					transform: 'scaleX(0)', 
					transformOrigin: 'right center',
					transition: 'transform 0.3s ease',
				}
				}}
			>
				About
			</Typography>
			</Box>


            {/* Auth section */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              {isAuthenticated ? (
                <UserDropdown />
              ) : (
                <AuthButton />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}