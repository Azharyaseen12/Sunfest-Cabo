import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Calendar, MapPin, Music2 } from 'lucide-react'
import {
	Button,
	Typography,
	Box,
	Grid,
	Card,
	CardMedia,
	CardContent,
	CardActionArea,
	Chip,
} from '@mui/material'
import api from '../utils/api'

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const FEATURED_EVENTS = [
	{
		id: 1,
		title: 'Dead & Company at Sphere',
		subtitle: '3 Concert & Hotel Experience Package',
		image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
		location: 'Sphere, Sands Avenue, Las Vegas, NV',
		dates: 'Multiple Dates Available',
		soldOut: true,
	},
	{
		id: 2,
		title: 'Kenny Chesney',
		subtitle: 'Concert & Hotel Experience Packages',
		image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
		location: 'Las Vegas, NV',
		dates: 'Multiple Dates Available',
	},
	{
		id: 3,
		title: 'Eagles at Sphere',
		subtitle: 'Experience & Hotel Packages',
		image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
		location: '255 Sands Ave, Las Vegas, NV 89169',
		dates: 'Multiple Dates Available',
	},
	{
		id: 4,
		title: 'Beyoncé - COWBOY CARTER TOUR',
		subtitle: 'Curated Experience Packages',
		image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
		location: 'Various Venues',
		dates: 'Multiple Dates Available',
	},
]

const cardStyles = {
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	'& .MuiCardActionArea-root': {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
	},
	'& .MuiCardContent-root': {
		flexGrow: 1,
		display: 'flex',
		flexDirection: 'column',
	},
}

const heroImage =
	'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'

export default function Home() {
	const [events, setEvents] = useState([])
	const [isScrolled, setIsScrolled] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await api.get(`events/events/`)
				setEvents(response.data)
			} catch (error) {
				console.error('Error fetching events:', error)
			}
		}

		fetchEvents()

		const handleScroll = () => {
			const scrollPosition = window.scrollY
			setIsScrolled(scrollPosition > 50)
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<Box className="min-h-screen">
			{/* Header */}
			<Box
				component="header"
				sx={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					zIndex: 1000,
					backgroundColor: isScrolled
						? 'rgba(255, 255, 255, 0.9)'
						: 'transparent',
					backdropFilter: isScrolled ? 'blur(8px)' : 'none',
					transition: 'all 0.3s ease-in-out',
					boxShadow: isScrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
				}}
			>
				<Box sx={{ px: { xs: 2, sm: 4 } }}>
					<Box className="flex items-center justify-between py-4">
						<Typography
							variant="h5"
							component="div"
							sx={{
								fontWeight: 'bold',
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								color: isScrolled ? 'text.primary' : 'white',
							}}
						>
							<Music2 className="h-6 w-6" />
							Sunset Fest Cabo
						</Typography>
						<Box className="hidden md:flex items-center gap-6">
							<Button
								component={Link}
								to="/events"
								sx={{ color: isScrolled ? 'text.primary' : 'white' }}
							>
								Events
							</Button>
							<Button
								variant="contained"
								color="primary"
								component={Link}
								to="/signin"
							>
								Sign in
							</Button>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Hero Section */}
			<Box
				sx={{
					position: 'relative',
					height: '80vh',
					minHeight: 500,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					textAlign: 'center',
					color: 'white',
					'&::before': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundImage: `url(${heroImage})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						filter: 'brightness(0.5)',
						zIndex: 0,
					},
				}}
			>
				<Box sx={{ position: 'relative', zIndex: 1, maxWidth: 800, px: 3 }}>
					<Typography
						variant="h2"
						component="h1"
						sx={{
							fontWeight: 'bold',
							mb: 3,
							fontSize: { xs: '2.5rem', md: '3.5rem' },
						}}
					>
						Experience the Ultimate Festival
					</Typography>
					<Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
						Join us for unforgettable moments with world-class artists in Cabo
					</Typography>
				</Box>
			</Box>

			{/* Events Section */}
			<Box
				sx={{
					px: { xs: 2, sm: 4 },
					py: 8,
					bgcolor: 'rgba(248, 248, 248, 0.9)',
					backdropFilter: 'blur(8px)',
				}}
			>
				<Typography
					variant="h4"
					component="h2"
					sx={{
						textAlign: 'center',
						mb: 6,
						fontWeight: 'bold',
					}}
				>
					Featured Events
				</Typography>

				<Grid
					container
					spacing={2}
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: 'repeat(2, 1fr)',
							md: 'repeat(3, 1fr)',
							lg: 'repeat(4, 1fr)',
						},
						gap: 2,
						'& > .MuiGrid-item': {
							width: '100%',
							margin: 0,
							padding: 0,
						},
					}}
				>
					{events.map((event) => (
						<Grid item key={event.id}>
							<Card sx={cardStyles}>
								<CardActionArea onClick={() => navigate(`/events/${event.id}`)}>
									<Box sx={{ position: 'relative' }}>
										<CardMedia
											component="img"
											height="200"
											image={event.image}
											alt={event.title}
											sx={{
												height: 200,
												objectFit: 'cover',
											}}
										/>
										{event.soldOut && (
											<Chip
												label="SOLD OUT"
												color="error"
												sx={{
													position: 'absolute',
													top: 16,
													left: -20,
													transform: 'rotate(-45deg)',
													borderRadius: 0,
													px: 4,
												}}
											/>
										)}
									</Box>
									<CardContent>
										<Box
											sx={{
												height: '100%',
												display: 'flex',
												flexDirection: 'column',
											}}
										>
											<Typography
												variant="h6"
												component="div"
												sx={{
													fontWeight: 'bold',
													mb: 1,
													fontSize: '1rem',
													lineHeight: 1.2,
													height: '2.4em',
													overflow: 'hidden',
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
												}}
											>
												{event.title}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													mb: 2,
													height: '3em',
													overflow: 'hidden',
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
												}}
											>
												{event.description}
											</Typography>
											<Box sx={{ mt: 'auto' }}>
												<Box className="flex items-center text-sm text-gray-500 mb-1">
													<Calendar className="h-4 w-4 mr-2" />
													<Typography variant="caption">
														{new Date(event.dates[0].date).toLocaleDateString()}
													</Typography>
												</Box>
												<Box className="flex items-center text-sm text-gray-500">
													<MapPin className="h-4 w-4 mr-2" />
													<Typography
														variant="caption"
														sx={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap',
														}}
													>
														{event.dates[0].city}
													</Typography>
												</Box>
											</Box>
										</Box>
									</CardContent>
								</CardActionArea>
							</Card>
						</Grid>
					))}
				</Grid>
			</Box>
		</Box>
	)
}
