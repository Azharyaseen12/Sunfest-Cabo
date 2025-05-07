import { Link } from 'react-router-dom'
import { Typography, Box, Divider, IconButton } from '@mui/material'
import AuthButton from './AuthButton'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import UserDropdown from './UserDropdown'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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

          {/* Toggle Button for Small Screens */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton onClick={toggleMenu} sx={{ color: 'white' }}>
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>

          {/* Navigation Links for Large Screens */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' }, // Hidden on small screens, visible on medium and up
              alignItems: 'center',
              gap: 6,
            }}
          >
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
                  },
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
                  },
                }}
              >
                About
              </Typography>
            </Box>

            {/* Auth Section for Large Screens */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              {isAuthenticated ? <UserDropdown /> : <AuthButton />}
            </Box>
          </Box>
        </Box>

        {/* Mobile Menu (Visible when toggled) */}
        <Box
          sx={{
            display: { xs: isMenuOpen ? 'flex' : 'none', md: 'none' }, // Show only on small screens when menu is open
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#2F2F2F',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            py: 4,
            gap: 3,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          <Typography
            component={Link}
            // to="/"
            onClick={() => setIsMenuOpen(false)} // Close menu on click
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '1.2rem',
            }}
          >
            Home
          </Typography>
          <Typography
            component={Link}
            // to="/events"
            onClick={() => setIsMenuOpen(false)} // Close menu on click
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '1.2rem',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            Events
          </Typography>
          <Typography
            component={Link}
            // to="/about"
            onClick={() => setIsMenuOpen(false)} // Close menu on click
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '1.2rem',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            About
          </Typography>
          <Box sx={{ mt: 2 }}>
            {isAuthenticated ? (
              <UserDropdown onClick={() => setIsMenuOpen(false)} />
            ) : (
              <AuthButton onClick={() => setIsMenuOpen(false)} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}