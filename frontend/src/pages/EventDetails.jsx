import { Link, useNavigate, useParams } from 'react-router'
import { Calendar, MapPin, Music2 } from 'lucide-react'
import {
	Typography,
	Box,
	Button,
	Card,
	CardContent,
	Tooltip,
	CircularProgress,
} from '@mui/material'
import Header from '../components/Header'
import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function EventDetails() {
	const [event, setEvent] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const navigate = useNavigate()
	const { eventId } = useParams()

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				setLoading(true)
				const response = await api.get(`events/events/${eventId}`)
				setEvent(response.data)
				setError(null)
			} catch (error) {
				console.error('Error fetching event:', error)
				setError('Failed to load event details. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		if (eventId) {
			fetchEvent()
		}
	}, [eventId])

	if (loading) {
		return (
			<Box className="min-h-screen bg-gray-50">
				<Header />
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

	if (error) {
		return (
			<Box className="min-h-screen bg-gray-50">
				<Header />
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
		)
	}

	if (!event) {
		return null
	}

	// Function to check if all packages are sold out for a date
	const areAllPackagesSoldOut = (date) => {
		if (!date.pricing_plans || date.pricing_plans.length === 0) return true
		return date.pricing_plans.every((plan) => plan.available_tickets === 0)
	}

	return (
		<Box className="min-h-screen max-w-[1440px] mx-auto bg-transparent">
			<Header />
			<Box sx={{ pt: 8 }}>
				{/* Hero Section */}
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						minHeight: '70vh',
						color: 'white',
						bgcolor: 'transparent',
					}}
				>
					{/* Left Image */}
					<Box
						sx={{
							flex: 1,
							position: 'relative',
							padding: { xs: 3, md: 6 },
							borderRadius: 4,
							overflow: 'hidden',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<img
							className="w-[500px] h-[500px]"
							src={'/hero.png'}
							alt={event.title}
						/>
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
							{event.title}
						</Typography>
						<Typography variant="body1" sx={{ mb: 4, color: 'white' }}>
							{event.description}
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
							October 24th -26th, 2025
						</Typography>
						<Button
							variant="contained"
							color="primary"
							sx={{ width: '200px', height: '50px' }}
							onClick={() => {
								document.querySelector('#available-dates').scrollIntoView({
									behavior: 'smooth',
								})
							}}
						>
							Book Now
						</Button>
					</Box>
				</Box>

				{/* Available Dates Section */}
				<Box sx={{ p: { xs: 3, md: 6 } }} id="available-dates">
					<Typography
						variant="h4"
						sx={{ mb: 4, fontWeight: 'bold', color: 'white' }}
					>
						Multiple event dates and locations available
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{event?.dates?.map((date) => {
							const isSoldOut = areAllPackagesSoldOut(date)
							return (
								<Card
									key={date.id}
									sx={{
										bgcolor: 'rgba(255, 255, 255, 0.2)',
										color: 'white',
										border: '2px solid #F821DB',
										borderRadius: 4,
										'&:hover': {
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
										},
									}}
								>
									<CardContent
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											flexWrap: { xs: 'wrap', md: 'nowrap' },
											gap: 2,
										}}
									>
										<Box>
											<Typography variant="h6" color="primary" sx={{ mb: 1 }}>
												{new Date(date.date).toLocaleDateString('en-US', {
													weekday: 'long',
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</Typography>
											<Typography variant="subtitle1" sx={{ mb: 1 }}>
												{date.city}
											</Typography>
											<Typography variant="body2">
												{date.description}
											</Typography>
										</Box>
										<Tooltip
											title={
												isSoldOut
													? 'All packages are sold out for this date'
													: 'View available packages'
											}
											placement="top"
										>
											<span>
												<Button
													variant="contained"
													color="primary"
													sx={{
														minWidth: { xs: '100%', md: 'auto' },
														whiteSpace: 'nowrap',
														opacity: isSoldOut ? 0.7 : 1,
														'&.Mui-disabled': {
															color: 'rgba(255, 255, 255, 0.8)',
															border: '2px solid #F821DB',
														},
													}}
													onClick={() =>
														!isSoldOut &&
														navigate(`/events/${eventId}/packages/${date.id}`)
													}
													disabled={isSoldOut}
												>
													See Packages
												</Button>
											</span>
										</Tooltip>
									</CardContent>
								</Card>
							)
						})}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
