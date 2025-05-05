import { useEffect, useState } from 'react'
import { Link } from 'react-router'
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
	Rating,
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
import Hotel from '../assets/images/Hotel.png'

export default function AccommodationSelection({packageId, onNext, setBookingData, bookingData}) {
	const [accommodations, setAccommodations] = useState([])
	const [selectedHotel, setSelectedHotel] = useState(null)
	const [dateDialogOpen, setDateDialogOpen] = useState(false)
	const [checkInDate, setCheckInDate] = useState(null)
	const [checkOutDate, setCheckOutDate] = useState(null)
	const [dateError, setDateError] = useState('')
	const [groupSizeData, setGroupSizeData] = useState(null)

	console.log("bookingData in AccommodationSelection", bookingData)
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
				const response = await api.get(`events/group-sizes/${bookingData.groupSize}`)
				setGroupSizeData(response.data.id)
			} catch (error) {
				console.error('Error fetching group size data:', error)
			}
		}

		fetchAccommodations()
		fetchGroupSizeData()
	}, [packageId, bookingData.groupSize])


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
		setBookingData({
			checkInDate: checkInDate.toISOString(),
			checkOutDate: checkOutDate.toISOString(),
			nights: calculatedNights,
			aId: accommodations[0].id,
			roomId: null,
			groupSize: groupSizeData,
		})
		onNext()
	}

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
				{/* Main Content */}
				<Box sx={{ maxWidth: 1200, mx: 'auto' }}>
					<Typography variant="h5" component="h4" gutterBottom>
						Choose Your Accommodation
					</Typography>

						<Box sx={{ mt: 2 ,}}>
							<Box
								sx={{
									backgroundColor: 'rgba(255, 255, 255, 0.13)',
									borderRadius: 2,
									overflow: 'hidden',
									boxShadow: 3,
								}}
							>
								<Box sx={{ p : 3}}>
									<Box sx={{ width: { xs: '100%' , }  , maxHeight: { xs: '600px'} , position: 'relative'}}>
										<img src={Hotel} alt="Hotel" />
									</Box>
									<Box sx={{ 
										width: { xs: '100%'}, 
										p: 4,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										position: 'relative'
									}}>
										<Box>
											<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, justifyContent: 'space-between' }}>
												<Typography variant="h4" component="h2" color="white" gutterBottom>
													The Palazzo at The Venetian Resort
												</Typography>
												<Rating
												value={5}
													color={'#F821DB'}
													readOnly
													sx={{ color: '#F821DB', fontSize: '2rem' }}
												/>
											</Box>

											<Typography variant="subtitle1" color="rgba(255, 255, 255, 0.8)">
												3325 S Las Vegas Blvd, Las Vegas, NV 89109
											</Typography>
											<Typography
												variant="body2"
												color="rgba(255, 255, 255, 0.5)"
												sx={{ mt: 3, mb: 2 }}
											>
												**The Venetian Resort has a standard Las Vegas Resort Fee of
												$62.36 inclusive of tax per night, payable upon check-in as well as $150 incidental hold per night.
												The iconic resort experience is marked by a commitment to sophisticated play and light-hearted luxury,
												 with world-class restaurants from celebrated chefs; the rejuvenating Canyon Ranch spa + fitness; a 
												 five-acre pool and garden deck inspired by the Italian Riviera including TAO Beach Dayclub, a 
												 Balinese-inspired tropical oasis; two landmark casinos and a poker room and unparalleled retail 
												 experiences at Grand Canal Shoppes.
											</Typography>
										</Box>
										
										<Button
											variant="contained"
											color="primary"
											
											onClick={() => handleSelectHotel(accommodations[0])}
											sx={{ mt: 2 , mx: 'auto', width: '400px'}}
										>
											Next
										</Button>

										<Typography variant="subtitle1" color="rgba(255, 255, 255, 0.8)" sx={{ position: 'absolute', bottom: 0, right: 0 , cursor: 'pointer'}}>
											Skip
										</Typography>
									</Box>
								</Box>
							</Box>
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
							backgroundColor: '#1E1E1E',
							backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
							color: '#FFFFFF',
							borderRadius: '12px',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.36)',
							},
						},
						}}
					>
						<DialogTitle sx={{ py: 3 }}>
						<Typography
							variant="h4"
							component="div"
							color="#FF4BEF"
							textAlign="center"
							fontWeight={600}
							letterSpacing={-0.5}
						>
							Select Your Stay Dates
						</Typography>
						<Typography
							variant="subtitle1"
							color="rgba(255, 255, 255, 0.8)"
							textAlign="center"
							mt={2}
							sx={{
							background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
							py: 1,
							mx: 'auto',
							maxWidth: '80%',
							}}
						>
							{selectedHotel?.title}
						</Typography>
						</DialogTitle>
						<DialogContent sx={{ py: 2 }}>
						<Stack spacing={5}>
							<Typography 
							variant="body1" 
							color="rgba(255, 255, 255, 0.7)" 
							textAlign="center"
							sx={{
								px: 2,
							}}
							>
							Please select your check-in and check-out dates. Minimum stay is {MIN_STAY} nights.
							</Typography>
							<Box sx={{ 
								display: 'flex', 
								gap: 2, 
								justifyContent: 'center',
								alignItems: 'center',
								}}>
								<Box sx={{ width: '100%', position: 'relative' }}>
									<label htmlFor="checkin-date" style={{
									position: 'absolute',
									top: '-8px',
									left: '12px',
									fontSize: '12px',
									padding: '0 4px',
									color: 'rgba(255, 255, 255, 0.9)',
									zIndex: 1,
									}}>
									Check-in Date
									</label>
									<input
									id="checkin-date"
									type="date"
									value={checkInDate ? checkInDate.toISOString().split('T')[0] : ''}
									onChange={(e) => handleDateChange(new Date(e.target.value), 'checkIn')}
									min={new Date().toISOString().split('T')[0]}
									style={{
										width: '100%',
										padding: '14px',
										borderRadius: '4px',
										backgroundColor: 'transparent',
										border: '1px solid rgba(255, 255, 255, 0.1)',
										color: 'rgba(255, 255, 255, 0.9)',
										fontSize: '16px',
										outline: 'none',
									}}
									/>
								</Box>

								<Box sx={{ width: '100%', position: 'relative' }}>
									<label htmlFor="checkout-date" style={{
									position: 'absolute',
									top: '-8px',
									left: '12px',
									fontSize: '12px',
									padding: '0 4px',
									color: 'rgba(255, 255, 255, 0.9)',
									zIndex: 1,
									}}>
									Check-out Date
									</label>
									<input
									id="checkout-date"
									type="date"
									value={checkOutDate ? checkOutDate.toISOString().split('T')[0] : ''}
									onChange={(e) => handleDateChange(new Date(e.target.value), 'checkOut')}
									min={checkInDate ? checkInDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
									style={{
										width: '100%',
										padding: '14px',
										borderRadius: '4px',
										backgroundColor: 'transparent',
										border: '1px solid rgba(255, 255, 255, 0.1)',
										color: 'rgba(255, 255, 255, 0.9)',
										fontSize: '16px',
										outline: 'none',
									}}
									/>
								</Box>
							</Box>
							{dateError && (
							<Box
								sx={{
								backgroundColor: 'rgba(255, 50, 50, 0.1)',
								borderLeft: '3px solid #FF4BEF',
								p: 1.5,
								borderRadius: '4px',
								}}
							>
								<Typography color="#FF4BEF" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<ErrorOutline fontSize="small" />
								{dateError}
								</Typography>
							</Box>
							)}
						</Stack>
						</DialogContent>
						<DialogActions sx={{ 
						px: 3, 
						py: 2, 
						borderTop: '1px solid rgba(255, 255, 255, 0.1)',
						gap: 1,
						}}>
						<Button 
							onClick={handleDateDialogClose}
							sx={{
							color: 'rgba(255, 255, 255, 0.7)',
							px: 3,
							py: 1,
							borderRadius: '8px',
							border: '1px solid rgba(255, 255, 255, 0.2)',
							'&:hover': {
								backgroundColor: 'rgba(255, 255, 255, 0.08)',
								borderColor: 'rgba(255, 255, 255, 0.4)',
							},
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDateSelection}
							variant="contained"
							disabled={
							!checkInDate ||
							!checkOutDate ||
							calculateNights(checkInDate, checkOutDate) < MIN_STAY
							}
							sx={{
							background: 'linear-gradient(45deg, #FF4BEF, #E100FF)',
							color: 'white',
							fontWeight: 600,
							px: 3,
							py: 1,
							borderRadius: '8px',
							textTransform: 'none',
							fontSize: '0.9375rem',
							'&:hover': {
								background: 'linear-gradient(45deg, #FF4BEF, #C000FF)',
							},
							'&.Mui-disabled': {
								background: 'rgba(255, 255, 255, 0.12)',
								color: 'rgba(255, 255, 255, 0.3)',
								boxShadow: 'none',
							},
							}}
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