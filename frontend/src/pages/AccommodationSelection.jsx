import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
	Box,
	Container,
	Typography,
	Button,
	Breadcrumbs,
	Card,
	CardMedia,
	CardContent,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Stack,
} from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Header from '../components/Header'
import api from '../utils/api'
import Carousel from '../components/Carousel'
import { useDispatch } from 'react-redux'
import { setDates } from '../store/slices/bookingSlice'

export default function AccommodationSelection() {
	const navigate = useNavigate()
	const { eventId, event_date_id, packageId, groupSize } = useParams()
	const [accommodations, setAccommodations] = useState([])
	const [selectedHotel, setSelectedHotel] = useState(null)
	const [dateDialogOpen, setDateDialogOpen] = useState(false)
	const [checkInDate, setCheckInDate] = useState(null)
	const [checkOutDate, setCheckOutDate] = useState(null)
	const [dateError, setDateError] = useState('')
	const [groupSizeData, setGroupSizeData] = useState(null)
	const MIN_STAY = 1 // Minimum number of nights required
	const dispatch = useDispatch()
	useEffect(() => {
		const fetchAccommodations = async () => {
			try {
				const response = await api.get(
					`events/accommodations?pricing_plan_id${packageId}`
				)
				setAccommodations(response.data)
			} catch (error) {
				console.error('Error fetching accommodations:', error)
			}
		}

		const fetchGroupSizeData = async () => {
			try {
				const response = await api.get(`events/group-sizes/${groupSize}`)
				setGroupSizeData(response.data.group_size)
			} catch (error) {
				console.error('Error fetching group size data:', error)
			}
		}

		fetchAccommodations()
		fetchGroupSizeData()
	}, [packageId, groupSize])

	const handleSelectHotel = (hotel) => {
		setSelectedHotel(hotel)
		setDateDialogOpen(true)
	}

	const handleDateDialogClose = () => {
		setDateDialogOpen(false)
		setSelectedHotel(null)
		setCheckInDate(null)
		setCheckOutDate(null)
		setDateError('')
	}

	const calculateNights = (checkIn, checkOut) => {
		if (!checkIn || !checkOut) return 0
		return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
	}

	const handleDateChange = (date, type) => {
		if (type === 'checkIn') {
			setCheckInDate(date)
			if (date && checkOutDate && date > checkOutDate) {
				setCheckOutDate(null)
			}
		} else {
			setCheckOutDate(date)
		}
		setDateError('')
	}

	const handleDateSelection = () => {
		if (!checkInDate || !checkOutDate) {
			setDateError('Please select both check-in and check-out dates')
			return
		}

		const calculatedNights = calculateNights(checkInDate, checkOutDate)
		if (calculatedNights < MIN_STAY) {
			setDateError(`Minimum stay is ${MIN_STAY} nights`)
			return
		}

		if (checkOutDate <= checkInDate) {
			setDateError('Check-out date must be after check-in date')
			return
		}
		dispatch(
			setDates({
				checkIn: checkInDate.toISOString(),
				checkOut: checkOutDate.toISOString(),
				nights: calculatedNights,
			})
		)
		// Navigate to rooms page with dates
		navigate(
			`/events/${eventId}/packages/${event_date_id}/plane/${packageId}/group-size/${groupSize}/accommodation/${selectedHotel.id}/rooms`,
			{
				state: {
					checkInDate: checkInDate.toISOString(),
					checkOutDate: checkOutDate.toISOString(),
					nights: calculatedNights,
				},
			}
		)
	}

	// Calculate total price based on selected dates
	// const calculateTotalPrice = () => {
	// 	if (!selectedHotel || !checkInDate || !checkOutDate) return 0
	// 	const calculatedNights = calculateNights(checkInDate, checkOutDate)
	// 	return parseFloat(
	// 		selectedHotel.price * (parseInt(groupSizeData) || 2) * calculatedNights
	// 	).toFixed(2)
	// }

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Header />
			<Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
				{/* Breadcrumb Navigation */}
				<Breadcrumbs
					separator={<ChevronRight size={16} color="#F821DB" />}
					sx={{ mb: 4 }}
				>
					<Link
						to={`/events/${eventId}/packages/${event_date_id}`}
						style={{
							color: 'white',
							textDecoration: 'none',
						}}
					>
						Packages
					</Link>
					<Link
						to={`/events/${eventId}/packages/${event_date_id}/plane/${packageId}/group-size`}
						style={{
							color: 'white',
							textDecoration: 'none',
						}}
					>
						Group Size
					</Link>
					<Typography color="primary">Accommodation</Typography>
					<Typography color="white">Rooms</Typography>
					<Typography color="white">Add-ons</Typography>
					<Typography color="white">Review</Typography>
				</Breadcrumbs>

				{/* Main Content */}
				<Box sx={{ maxWidth: 1200, mx: 'auto' }}>
					<Typography variant="h3" component="h1" gutterBottom>
						Choose Your Accommodation
					</Typography>

					{/* Hotel Cards */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
							gap: 3,
							mt: 4,
						}}
					>
						{accommodations.map((hotel) => (
							<Card
								key={hotel.id}
								sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									backgroundColor: 'rgba(255, 255, 255, 0.2)',
									borderRadius: 2,
									'&:hover': {
										boxShadow: 6,
									},
								}}
							>
								<Carousel images={hotel.images} alt={hotel.title} />
								<CardContent
									sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
								>
									<Typography
										variant="h5"
										component="h2"
										color="white"
										gutterBottom
									>
										{hotel.title}
									</Typography>
									<Typography variant="subtitle2" color="primary.main">
										May 22 - 24, 2025{' '}
										<Typography
											component="span"
											variant="caption"
											color="primary.main"
										>
											(Additional Nights Available)
										</Typography>
									</Typography>
									<Typography
										variant="body2"
										color="rgba(255, 255, 255, 0.8)"
										sx={{ mt: 2, mb: 'auto' }}
									>
										{hotel.description.replace(/\*\*.*?\.\s*/, '')}
									</Typography>
									<Box sx={{ mt: 3 }}>
										<Typography
											variant="caption"
											color="rgba(255, 255, 255, 0.8)"
											paragraph
										>
											{hotel.description.match(/\*\*.*?\./)?.[0] || ''}
										</Typography>
										<Typography
											variant="h5"
											color="primary.main"
											gutterBottom
											align="center"
										>
											From ${parseFloat(hotel.price).toFixed(2)} USD
											<Typography
												component="span"
												variant="body2"
												color="white"
												sx={{ ml: 1 }}
											>
												/ Person
											</Typography>
										</Typography>
										<Typography
											variant="body2"
											align="center"
											color="rgba(255, 255, 255, 0.8)"
											paragraph
										>
											$
											{parseFloat(
												hotel.price * (parseInt(groupSizeData) || 2)
											).toFixed(2)}{' '}
											USD Total (Taxes and fees included)
											<br />
											*Price shown based on {groupSizeData || 2} people
										</Typography>
										<Button
											variant="contained"
											color="primary"
											fullWidth
											onClick={() => handleSelectHotel(hotel)}
										>
											Select Hotel
										</Button>
									</Box>
								</CardContent>
							</Card>
						))}
					</Box>
				</Box>

				{/* Date Selection Dialog */}
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<Dialog
						open={dateDialogOpen}
						onClose={handleDateDialogClose}
						maxWidth="sm"
						fullWidth
						slotProps={{
							paper: {
								sx: {
									backgroundColor: 'rgba(255, 255,255, 0.8)',
									// backdropFilter: 'blur(10px)',
									color: 'black',
								},
							},
						}}
					>
						<DialogTitle>
							<Typography variant="h5" component="div">
								Select Your Stay Dates
							</Typography>
							<Typography variant="subtitle2">
								{selectedHotel?.title}
							</Typography>
						</DialogTitle>
						<DialogContent>
							<Stack spacing={3} sx={{ mt: 2 }}>
								<Typography variant="body2">
									Please select your check-in and check-out dates. Minimum stay
									is {MIN_STAY} nights.
								</Typography>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<DatePicker
										label="Check-in Date"
										value={checkInDate}
										onChange={(newValue) =>
											handleDateChange(newValue, 'checkIn')
										}
										minDate={new Date()}
										renderInput={(params) => (
											<TextField {...params} fullWidth />
										)}
									/>

									<DatePicker
										label="Check-out Date"
										value={checkOutDate}
										onChange={(newValue) =>
											handleDateChange(newValue, 'checkOut')
										}
										minDate={checkInDate || new Date()}
										renderInput={(params) => (
											<TextField {...params} fullWidth />
										)}
									/>
								</Box>

								{/* {checkInDate && checkOutDate && (
									<Box
										sx={{
											p: 2,
											bgcolor: 'background.default',
											borderRadius: 1,
											border: '1px solid',
											borderColor: 'divider',
										}}
									>
										<Typography variant="subtitle1" gutterBottom>
											Stay Summary
										</Typography>
										<Typography variant="body2">
											{checkInDate.toLocaleDateString()} -{' '}
											{checkOutDate.toLocaleDateString()}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{calculateNights(checkInDate, checkOutDate)} nights
										</Typography>
										<Typography variant="body2" sx={{ mt: 1 }}>
											Estimated Total: ${calculateTotalPrice()} USD
											<Typography
												component="span"
												variant="caption"
												color="text.secondary"
												sx={{ ml: 1 }}
											>
												(Taxes and fees included)
											</Typography>
										</Typography>
									</Box>
								)} */}

								{dateError && (
									<Typography color="error" variant="body2">
										{dateError}
									</Typography>
								)}
							</Stack>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleDateDialogClose}>Cancel</Button>
							<Button
								onClick={handleDateSelection}
								variant="contained"
								color="primary"
								disabled={
									!checkInDate ||
									!checkOutDate ||
									calculateNights(checkInDate, checkOutDate) < MIN_STAY
								}
							>
								Continue
							</Button>
						</DialogActions>
					</Dialog>
				</LocalizationProvider>
			</Container>
		</Box>
	)
}
