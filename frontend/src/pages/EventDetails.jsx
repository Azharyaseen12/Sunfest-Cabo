import { Typography, Box, Button, CircularProgress } from '@mui/material'
import Header from '../components/Header'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import PackageCard from '../components/PackageCard'
import Logo from '../assets/images/SunsetFestLogo.svg'

export default function EventDetails() {
	const [packages, setPackages] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchPackages = async () => {
			try {
				setLoading(true)
				const response = await api.get(`event/packages/`)
				console.log('PACKAGES:', response.data)
				setPackages(response.data)
				setError(null)
			} catch (error) {
				console.error('Error fetching packages:', error)
				setError('Failed to load packages. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		fetchPackages()
	}, [])

	if (loading) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						minHeight: '80vh',
					}}
				>
					<CircularProgress />
				</Box>
			</Box>
		)
	}

	// const isPackageSoldOut = (pkg) => {
	//   return pkg.is_active === false
	// }

	const handleScrollToPackages = () => {
		window.scrollBy({
			top: window.innerHeight - 100,
			behavior: 'smooth',
		})
	}

	return (
		<Box className="min-h-screen bg-transparent">
			<Header />
			<Box sx={{ pt: 8, maxWidth: '1440px', mx: 'auto', width: '100%' }}>
				{/* Hero Section */}
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						color: 'white',
						bgcolor: 'transparent',
						width: '100%',
						px: { xs: 2, md: 4 },
						minHeight: '88vh',
					}}
				>
					{/* Left Image */}
					<Box
						sx={{
							flex: 1,
							position: 'relative',
							borderRadius: 4,
							overflow: 'hidden',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<img src={Logo} alt="Event Logo" />
					</Box>

					{/* Right Content */}
					<Box
						sx={{
							flex: 1,
							p: { xs: 3, md: 6 },
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							textAlign: 'right',
							alignItems: 'flex-end',
						}}
					>
						<Typography
							variant="h2"
							component="h1"
							sx={{
								fontSize: { xs: '2rem', md: '3rem' },
								fontWeight: 'bold',
								mb: 3,
							}}
						>
							Escape to <span style={{ color: '#F821DB' }}>Cabo</span> for the
							Live Music Getaway
						</Typography>
						<Typography variant="body1" sx={{ mb: 4, color: 'white' }}>
							Join us for an unforgettable experience in Cabo San Lucas —
							featuring world-class performances, luxury accommodations, and
							thrilling excursions. Book your all-in-one package now.
						</Typography>
						<Typography
							variant="h4"
							sx={{
								mb: 4,
								fontWeight: 'bold',
								background:
									'linear-gradient(to right,#F821DB,#B549D8,#8D7BB1, #5526FF)',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}
						>
							October 24th - 26th, 2025
						</Typography>
						<Button
							variant="contained"
							color="primary"
							sx={{ width: '200px', height: '50px' }}
							onClick={handleScrollToPackages}
						>
							View Packages
						</Button>
					</Box>
				</Box>

				{/* Packages Section */}
				{error ? (
					<Box className="bg-transparent text-white">
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								minHeight: '80vh',
							}}
						>
							<Typography color="error">{error}</Typography>
						</Box>
					</Box>
				) : (
					<Box
						sx={{
							py: 8,
							width: '100%',
							px: { xs: 2, md: 4 },
						}}
						id="packages-section"
					>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
								gap: 4,
							}}
						>
							{packages?.flatMap((pkg) => (
								<PackageCard key={pkg.id} pkg={pkg} />
							))}
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	)
}
