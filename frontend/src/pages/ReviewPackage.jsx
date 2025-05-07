import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router'
import PayPalButton from './PayPalButton'
import StripeButton from './StripeButton'
import {
	Box,
	Container,
	Typography,
	Button,
	Breadcrumbs,
	Card,
	CardMedia,
	Alert,
} from '@mui/material'
import { Checkbox, FormControlLabel } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import api from '../utils/api'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

export default function ReviewPackage() {
	const location = useLocation()

	const [event, setEvent] = useState(null)
	const [pricingPlan, setPricingPlan] = useState(null)
	const [accommodation, setAccommodation] = useState(null)
	const [rooms, setRooms] = useState([])
	const [addOns, setAddOns] = useState([])
	const [groupSizeData, setGroupSizeData] = useState(null)
	const [loginuseremail, setLoginuseremail] = useState(null)
	const [email, setEmail] = useState('')
	const [confirmEmail, setConfirmEmail] = useState('')
	const [subscribe, setSubscribe] = useState(false)
	const [roomQuantities, setRoomQuantities] = useState({})
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)
	const { groupSize, aId, roomIds } = bookingData;

	useEffect(() => {
		const fetchData = async () => {
			if (!eventId || !packageId || !aId || !roomIds) {
				console.error('Missing required parameters')
				return
			}

			try {
				const user = localStorage.getItem('user')
				if (user) {
					const parsedUser = JSON.parse(user)
					if (parsedUser?.email) {
						setLoginuseremail(parsedUser.email)
					}
				}

				// Fetch Event
				const eventResponse = await api.get(`events/events/${eventId}`)
				setEvent(eventResponse.data)

				// Fetch Pricing Plan
				const pricingResponse = await api.get(
					`events/pricing-plans/${packageId}`
				)
				setPricingPlan(pricingResponse.data)

				// Fetch Group Size Data
				const groupSizeResponse = await api.get(
					`events/group-sizes?pricing_plan_id=${packageId}`
				)
				const selectedGroupSize = groupSizeResponse.data.find(
					(group) => group.id === groupSize
				)
				setGroupSizeData(selectedGroupSize)

				// Fetch Accommodation
				const accomResponse = await api.get(`events/accommodations/${aId}`)
				setAccommodation(accomResponse.data)

				// Fetch Rooms
				const roomIdArray = roomIds.split(',')
				const roomPromises = roomIdArray.map((id) =>
					api.get(`events/rooms/${id}`)
				)
				const roomResponses = await Promise.all(roomPromises)
				setRooms(roomResponses.map((response) => response.data))

				// Add-ons from location state
				if (location.state?.selectedAddOns) {
					setAddOns(location.state.selectedAddOns)
				}

				// Get room quantities from location state
				const roomQuantities = location.state?.roomQuantities || {}
				setRoomQuantities(roomQuantities)
			} catch (error) {
				console.error('Error fetching review data:', error)
				setError('Failed to load booking details. Please try again.')
			}
		}

		fetchData()
	}, [eventId, packageId, aId, roomIds, location.state])

	const checkInDate = bookingData.checkInDate
	const checkOutDate = bookingData.checkOutDate

	const handleCheckout = async () => {
		try {
			// Get user details from form
			const firstName = document.querySelector(
				'input[placeholder="Enter first name"]'
			).value
			const lastName = document.querySelector(
				'input[placeholder="Enter last name"]'
			).value
			const email = document.querySelector(
				'input[placeholder="Enter email address"]'
			).value

			// Validate form fields
			if (!firstName || !lastName || !email) {
				setError('Please fill in all required fields')
				toast.error('Please fill in all required fields')
				return
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(email)) {
				setError('Please enter a valid email address')
				toast.error('Please enter a valid email address')
				return
			}

			// Prepare rooms data with quantities
			const roomsData = rooms.map((room) => ({
				room_id: room.id,
				quantity: roomQuantities[room.id] || 1,
			}))

			// Prepare add-ons data
			// const addOnsData = addOns.map((addon) => ({
			// 	add_on_id: addon.addOn.id,
			// 	time_slot_id: addon.timeSlot?.id,
			// 	quantity: addon.quantity,
			// }))
			const addOnsData = []

			const bookingData = {
				event_date: event_date_id,
				pricing_plan: packageId,
				group_size: groupSize,
				hotel_booking: {
					accommodation_id: aId,
					check_in_date: new Date(checkInDate).toISOString().split('T')[0],
					check_out_date: new Date(checkOutDate).toISOString().split('T')[0],
					checkin_first_name: firstName,
					checkin_last_name: lastName,
					checkin_email: email,
				},
				rooms: roomsData,
				add_ons: addOnsData,
				user_email: email,
				ticket_hold_id: null,
			}

			// Show loading state
			setLoading(true)
			setError(null)

			// Create booking
			const response = await api.post('events/bookings/', bookingData)
			console.log('Booking Response:', response.data)

			// Show success message
			toast.success('Booking created successfully!')

			// Redirect to booking success page with booking ID
			window.location.href = `/booking-success?booking_id=${response.data.id}`
		} catch (error) {
			console.error('Error during booking:', error)
			const errorMessage =
				error.response?.data?.message ||
				'Failed to create booking. Please try again.'
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	// Calculate Pricing
	const groupSizeNum = groupSizeData?.number_of_persons || 1

	// Placeholder prices (for display only)
	const packagePrice = parseFloat(pricingPlan?.price || 0) * groupSizeNum
	const accomPrice = parseFloat(accommodation?.price || 0) * groupSizeNum

	// Actual prices from selected rooms (includes all other prices and taxes)
	const roomsPrice = rooms.reduce(
		(total, room) => total + parseFloat(room?.price || 0),
		0
	)

	// Add-ons price
	const addOnsPrice = addOns.reduce((total, addon) => {
		// Use the totalPrice from the add-on selection if available
		if (addon.totalPrice) {
			return total + addon.totalPrice
		}
		// Fallback to calculating price if totalPrice is not available
		const addonPrice = addon.timeSlot?.price_override || addon.addOn?.price || 0
		return total + addon.quantity * addonPrice
	}, 0)

	// Final total (rooms price already includes all other prices and taxes)
	const grandTotal = roomsPrice + addOnsPrice

	// Format Dates
	const formatDates = (start, end) => {
		if (!start || !end) return 'May 22 - 24, 2025'
		const startDate = new Date(start).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		})
		const endDate = new Date(end).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
		return `${startDate} - ${endDate}`
	}

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
				{error && (
					<Alert severity="error" sx={{ mb: 4 }}>
						{error}
					</Alert>
				)}

				<Typography variant="h3" component="h1" gutterBottom>
					Review Package
				</Typography>

				<Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
					{/* Left Column - Package Details */}
					<Box sx={{ flex: '1 1 60%' }}>
						{/* User Information */}
						<Card
							sx={{
								mb: 4,
								overflow: 'visible',
								bgcolor: 'rgba(255, 255, 255, 0.2)',
								borderRadius: 3,
							}}
						>
							<Box sx={{ p: 3 }}>
								<Typography
									variant="h5"
									gutterBottom
									color="white"
									align="center"
								>
									User Information
								</Typography>
								<Box sx={{ color: 'white' }}>
									<Typography variant="h5" gutterBottom>
										Secure Booking
									</Typography>
									<Typography variant="subtitle1" gutterBottom>
										Contact Information
									</Typography>
									<Typography variant="body2" gutterBottom>
										{!loginuseremail ? (
											<>
												Already have an account?{' '}
												<Link href="/signin">Sign In</Link>
											</>
										) : (
											<>
												Have a different acount?
												<Link href="/signin">Sign out</Link>
											</>
										)}
									</Typography>
									{loginuseremail ? (
										<>
											<Typography variant="body1" gutterBottom>
												{loginuseremail}
											</Typography>
										</>
									) : (
										<>
											<input
												fullWidth
												label="Email Address"
												variant="outlined"
												margin="normal"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="Email Address"
												style={{
													backgroundColor: 'rgba(255, 255, 255, 0.1)',
													border: '1px solid rgba(255, 255, 255, 0.2)',
													borderRadius: '8px',
													color: 'white',
													padding: '12px',
													width: '100%',
													outline: 'none',
												}}
											/>
											<input
												fullWidth
												label="Confirm Email Address"
												variant="outlined"
												margin="normal"
												value={confirmEmail}
												onChange={(e) => setConfirmEmail(e.target.value)}
												placeholder="Confirm Email Address"
												style={{
													backgroundColor: 'rgba(255, 255, 255, 0.1)',
													border: '1px solid rgba(255, 255, 255, 0.2)',
													borderRadius: '8px',
													color: 'white',
													padding: '12px',
													width: '100%',
													outline: 'none',
													marginTop: '10px',
												}}
											/>
										</>
									)}
									<FormControlLabel
										control={
											<Checkbox
												checked={subscribe}
												onChange={(e) => setSubscribe(e.target.checked)}
												color="primary"
											/>
										}
										label="Keep me up to date on news and offers"
									/>
								</Box>
							</Box>
						</Card>
						{/* Package Information */}
						<Card
						sx={{
							mb: 4,
							overflow: 'visible',
							bgcolor: 'rgba(255, 255, 255, 0.2)',
							borderRadius: 3,
						}}
						>
						<Box sx={{ p: 3 }}>
							<Typography
							variant="h5"
							gutterBottom
							color="white"
							align="center"
							>
							Package Information
							</Typography>
							<Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
							<CardMedia
								component="img"
								sx={{ width: 120, height: 120, borderRadius: 1 }}
								image={
								bookingData?.event?.images?.[0]?.image ||
								'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2067&auto=format&fit=crop'
								}
								alt={bookingData?.event?.title}
							/>
							<Box>
								<Typography variant="h6" color="white">
								{bookingData?.event?.title || 'Event Title'}
								</Typography>
								<Typography color="primary" sx={{ mt: 1 }}>
								{formatDates(bookingData?.selectedDate?.event_day?.date, bookingData?.selectedDate?.event_day?.date) || 'N/A'}
								</Typography>
								<Typography color="white">
								{bookingData?.event?.location || 'Unknown Location'}
								</Typography>
								<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									mt: 2,
									color: 'white',
								}}
								>
								<Typography>
									{bookingData?.selectedTicket ? 'Selected Package' : 'Package'} for {bookingData?.groupSize || 1} {bookingData?.groupSize === 1 ? 'person' : 'people'}
								</Typography>
								<Button
									variant="text"
									color="primary"
									endIcon={<ChevronRight size={16} />}
									component={Link}
									to={`/events/${eventId}/packages/${event_date_id}`}
								>
									Change
								</Button>
								</Box>
							</Box>
							</Box>
						</Box>
						</Card>

						{/* Hotel Information */}
				        <Card
						sx={{
							mb: 4,
							overflow: 'visible',
							bgcolor: 'rgba(255, 255, 255, 0.2)',
							borderRadius: 3,
						}}
						>
						<Box sx={{ p: 3 }}>
							<Typography
							variant="h5"
							gutterBottom
							color="white"
							align="center"
							>
							Hotel Information
							</Typography>
							<Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
							<CardMedia
								component="img"
								sx={{ width: 120, height: 120, borderRadius: 1 }}
								image={
								bookingData?.hotel?.images?.[0]?.image ||
								'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'
								}
								alt={bookingData?.hotel?.hotel_name}
							/>
							<Box sx={{ flex: 1 }}>
								<Typography variant="h6" color="white">
								{bookingData?.hotel?.hotel_name || 'Hotel Name'}
								</Typography>
								<Typography color="primary">
								{bookingData?.hotel?.address || 'Unknown Address'}
								</Typography>
								<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'end',
									mt: 2,
								}}
								>
								<Box>
									<Typography color="white">Selected Rooms:</Typography>
									{bookingData?.selectedRooms?.map((room) => (
									<Typography key={room.id} color="white">
										{room.title} (${room.price}) x {bookingData.roomQuantities[room.id] || 1}
									</Typography>
									))}
								</Box>
								<Button
									variant="text"
									color="primary"
									endIcon={<ChevronRight size={16} />}
									component={Link}
									to={`/events/${eventId}/packages/${event_date_id}/plane/${packageId}/group-size/${bookingData?.groupSize}/accommodation/${bookingData?.hotel?.id}/rooms`}
								>
									Change
								</Button>
								</Box>
							</Box>
							</Box>
						</Box>
						</Card>
						{/* Hotel Information */}
						<Card
							sx={{
								mb: 4,
								overflow: 'visible',
								bgcolor: 'rgba(255, 255, 255, 0.2)',
								borderRadius: 3,
							}}
						>
							<Box sx={{ p: 3 }}>
								<Typography
									variant="h5"
									gutterBottom
									color="white"
									align="center"
								>
									CheckIn Person Information
								</Typography>
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'column',
										gap: 3,
										mt: 3,
									}}
								>
									<Typography
										variant="body1"
										color="white"
										sx={{ fontStyle: 'italic', textAlign: 'center', mb: 2 }}
									>
										The person checking into the hotel must be 21 or older and
										present a valid Photo ID and credit card.
									</Typography>

									<CardMedia
										component="img"
										sx={{
											width: '100%',
											height: 200,
											borderRadius: 2,
											objectFit: 'cover',
											mb: 3,
										}}
										image="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2067&auto=format&fit=crop"
										alt="Hotel Check-in"
									/>

									<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
										<Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
											<Typography color="white" gutterBottom>
												First Name
											</Typography>
											<input
												type="text"
												placeholder="Enter first name"
												style={{
													backgroundColor: 'rgba(255, 255, 255, 0.1)',
													border: '1px solid rgba(255, 255, 255, 0.2)',
													borderRadius: '8px',
													color: 'white',
													padding: '12px',
													width: '100%',
													outline: 'none',
												}}
											/>
										</Box>

										<Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
											<Typography color="white" gutterBottom>
												Last Name
											</Typography>
											<input
												type="text"
												placeholder="Enter last name"
												style={{
													backgroundColor: 'rgba(255, 255, 255, 0.1)',
													border: '1px solid rgba(255, 255, 255, 0.2)',
													borderRadius: '8px',
													color: 'white',
													padding: '12px',
													width: '100%',
													outline: 'none',
												}}
											/>
										</Box>

										<Box sx={{ flex: '1 1 100%' }}>
											<Typography color="white" gutterBottom>
												Email Address
											</Typography>
											<input
												type="email"
												placeholder="Enter email address"
												style={{
													backgroundColor: 'rgba(255, 255, 255, 0.1)',
													border: '1px solid rgba(255, 255, 255, 0.2)',
													borderRadius: '8px',
													color: 'white',
													padding: '12px',
													width: '100%',
													outline: 'none',
												}}
											/>
										</Box>
									</Box>
								</Box>
							</Box>
						</Card>

						{/* Add-ons Information */}
						{bookingData?.selectedAddOns?.length > 0 && (
						<Card
							sx={{
							mb: 4,
							overflow: 'visible',
							bgcolor: 'rgba(255, 255, 255, 0.2)',
							borderRadius: 3,
							}}
						>
							<Box sx={{ p: 3 }}>
							<Typography
								variant="h5"
								color="white"
								gutterBottom
								align="center"
							>
								Selected Add-ons
							</Typography>
							{bookingData.selectedAddOns.map((addon, index) => {
								const totalPrice =
								addon.totalPrice ||
								addon.quantity * (addon.timeSlot?.price_override || addon.addOn?.price || 0);

								return (
								<Box
									key={`${addon.addOn?.id}-${index}`}
									sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									py: 2,
									borderBottom:
										index < bookingData.selectedAddOns.length - 1 ? '1px solid' : 'none',
									borderColor: 'divider',
									}}
								>
									<Box>
									<Typography variant="subtitle1" color="white">
										{addon.addOn?.title || 'Add-on'}
									</Typography>
									{addon.timeSlots?.map((slot, slotIndex) => (
										<Typography
										key={slotIndex}
										variant="body2"
										color="white"
										>
										{new Date(slot.start_time).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
										})}{' '}
										- {slot.quantity} spots
										</Typography>
									))}
									</Box>
									<Typography variant="subtitle1" color="primary">
									${totalPrice.toFixed(2)} USD
									</Typography>
								</Box>
								);
							})}
							<Box
								sx={{
								display: 'flex',
								justifyContent: 'flex-end',
								mt: 2,
								}}
							>
								<Button
								variant="text"
								color="primary"
								endIcon={<ChevronRight size={16} />}
								component={Link}
								to={`/events/${eventId}/packages/${event_date_id}/plane/${packageId}/group-size/${bookingData?.groupSize}/accommodation/${bookingData?.hotel?.id}/rooms/${bookingData?.roomIdsWithQuantities}/add-ons`}
								>
								Change
								</Button>
							</Box>
							</Box>
						</Card>
						)}
					</Box>

					{/* Right Column - Price Summary */}
					<Box sx={{ flex: '1 1 40%' }}>
						<Card
							sx={{
							position: 'sticky',
							top: 100,
							bgcolor: 'rgba(255, 255, 255, 0.2)',
							borderRadius: 3,
							}}
						>
							<Box sx={{ p: 3 }}>
							<Typography
								variant="h5"
								gutterBottom
								color="white"
								align="center"
							>
								Trip Summary
							</Typography>
							<Box sx={{ mt: 3 }}>
								{/* Package Price: ticketPrice * groupSize */}
								<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									mb: 2,
								}}
								>
								<Typography color="white">
									Package Price ({bookingData?.groupSize || 1} {bookingData?.groupSize === 1 ? 'person' : 'people'})
								</Typography>
								<Typography color="primary">
									${(parseFloat(bookingData?.ticketPrice || 0) * (bookingData?.groupSize || 1)).toFixed(2)} USD
								</Typography>
								</Box>
								{/* Accommodation Price: Assume a price per person per night if hotel.price is missing */}
								<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									mb: 2,
								}}
								>
								<Typography color="white">
									Accommodation ({bookingData?.groupSize || 1} {bookingData?.groupSize === 1 ? 'person' : 'people'})
								</Typography>
								<Typography color="primary">
									${((bookingData?.hotel?.price ? parseFloat(bookingData.hotel.price) : 100) * (bookingData?.groupSize || 1) * (bookingData?.nights || 1)).toFixed(2)} USD
								</Typography>
								</Box>
								{/* Rooms Price: Direct from bookingData.roomsPrice */}
								<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									mb: 2,
								}}
								>
								<Typography color="white">Room(s)</Typography>
								<Typography color="primary">
									${(bookingData?.roomsPrice || 0).toFixed(2)} USD
								</Typography>
								</Box>
								{/* Add-ons Price: Calculate from selectedAddOns */}
								{bookingData?.selectedAddOns?.length > 0 && (
								<Box
									sx={{
									display: 'flex',
									justifyContent: 'space-between',
									mb: 2,
									}}
								>
									<Typography color="white">Add-ons</Typography>
									<Typography color="primary">
									${(bookingData.selectedAddOns.reduce((total, addon) => {
										return total + (addon.totalPrice || addon.quantity * (addon.timeSlot?.price_override || addon.addOn?.price || 0));
									}, 0)).toFixed(2)} USD
									</Typography>
								</Box>
								)}
								{/* Total Price: Sum of all components */}
								<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									mt: 3,
									pt: 3,
									borderTop: '2px solid #F821DB',
									borderColor: '#F821DB',
								}}
								>
								<Typography variant="h6" color="white">
									Total
								</Typography>
								<Typography variant="h6" color="primary">
									${(
									(parseFloat(bookingData?.ticketPrice || 0) * (bookingData?.groupSize || 1)) + // Package price
									((bookingData?.hotel?.price ? parseFloat(bookingData.hotel.price) : 100) * (bookingData?.groupSize || 1) * (bookingData?.nights || 1)) + // Accommodation price
									(bookingData?.roomsPrice || 0) + // Rooms price
									(bookingData?.selectedAddOns?.reduce((total, addon) => {
										return total + (addon.totalPrice || addon.quantity * (addon.timeSlot?.price_override || addon.addOn?.price || 0));
									}, 0) || 0) // Add-ons price
									).toFixed(2)} USD
								</Typography>
								</Box>
							</Box>
							<Button
								variant="contained"
								color="primary"
								fullWidth
								size="large"
								disabled={loading}
								sx={{ mt: 3 }}
							>
								{loading ? 'Creating Booking...' : 'Proceed to Checkout'}
							</Button>
							{/* Calculate totalPrice to pass to payment buttons */}
							{
								(() => {
								const totalPrice = (
									(parseFloat(bookingData?.ticketPrice || 0) * (bookingData?.groupSize || 1)) +
									((bookingData?.hotel?.price ? parseFloat(bookingData.hotel.price) : 100) * (bookingData?.groupSize || 1) * (bookingData?.nights || 1)) +
									(bookingData || 0) +
									(bookingData.selectedAddOns?.reduce((total, addon) => {
									return total + (addon.totalPrice || addon.quantity * (addon.timeSlot?.price_override || addon.addOn?.price || 0));
									}, 0) || 0)
								);
								return (
									<div style={{ textAlign: 'center', padding: '20px' }}>
									<h1>Buy Now for ${totalPrice.toFixed(2)}</h1>
									<PayPalButton totalPrice={totalPrice} />
									<StripeButton totalPrice={totalPrice} />
									</div>
								);
								})()
							}
							</Box>
						</Card>
						</Box>
				</Box>
			</Container>
		</Box>
	)
}
