import { useEffect, useState } from 'react'
import {
	Box,
	Container,
	Typography,
	Button,
	Card,
	CardContent,
	Rating,
	IconButton,
	Tooltip,
	Alert,
	Grid,
} from '@mui/material'
import {
	ChevronRight,
	ChevronLeft,
	ChevronRight as ChevronRightIcon,
} from 'lucide-react'
import api from '../utils/api'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedRooms } from '../store/slices/bookingSlice'

const Carousel = ({ alt }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const defaultImage =
		'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=1974&auto=format&fit=crop'
	const displayImages = [{ image: defaultImage }]

	const handlePrev = () => {
		setCurrentIndex((prev) =>
			prev === 0 ? displayImages.length - 1 : prev - 1
		)
	}

	const handleNext = () => {
		setCurrentIndex((prev) =>
			prev === displayImages.length - 1 ? 0 : prev + 1
		)
	}

	return (
		<Box
			sx={{
				position: 'relative',
				height: 500,
				borderRadius: 2,
				width: '100%',
			}}
		>
			<Box
				sx={{
					height: '100%',
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 3,
				}}
			>
				<img
					src={displayImages[currentIndex].image}
					alt={alt}
					style={{
						width: '60%',
						height: '100%',
						transition: 'opacity 0.3s ease-in-out',
						borderRadius: '20px',
						objectFit: 'cover',
					}}
				/>
				<img
					src={displayImages[currentIndex].image}
					alt={alt}
					style={{
						width: '25%',
						height: '100%',
						transition: 'opacity 0.3s ease-in-out',
						borderRadius: '20px',
						objectFit: 'cover',
					}}
				/>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: 3,
						height: '100%',
						flexDirection: 'column',
						width: '15%',
					}}
				>
					<img
						src={displayImages[currentIndex].image}
						alt={alt}
						style={{
							width: '100%',
							height: '100%',
							transition: 'opacity 0.3s ease-in-out',
							borderRadius: '20px',
						}}
					/>
					<img
						src={displayImages[currentIndex].image}
						alt={alt}
						style={{
							width: '100%',
							height: '100%',
							transition: 'opacity 0.3s ease-in-out',
							borderRadius: '20px',
						}}
					/>
				</Box>
			</Box>

			{displayImages.length > 1 && (
				<>
					<IconButton
						onClick={handlePrev}
						sx={{
							position: 'absolute',
							top: '50%',
							left: 8,
							transform: 'translateY(-50%)',
							bgcolor: 'rgba(0, 0, 0, 0.5)',
							color: 'white',
							'&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
						}}
					>
						<ChevronLeft size={24} />
					</IconButton>
					<IconButton
						onClick={handleNext}
						sx={{
							position: 'absolute',
							top: '50%',
							right: 8,
							transform: 'translateY(-50%)',
							bgcolor: 'rgba(0, 0, 0, 0.5)',
							color: 'white',
							'&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
						}}
					>
						<ChevronRightIcon size={24} />
					</IconButton>
					<Box
						sx={{
							position: 'absolute',
							bottom: 8,
							left: '50%',
							transform: 'translateX(-50%)',
							display: 'flex',
							gap: 1,
						}}
					>
						{displayImages.map((_, index) => (
							<Box
								key={index}
								sx={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									bgcolor:
										index === currentIndex
											? 'primary.main'
											: 'rgba(255, 255, 255, 0.5)',
									transition: 'background-color 0.3s',
								}}
							/>
						))}
					</Box>
				</>
			)}
		</Box>
	)
}

export default function RoomSelection({
	bookingData,
	setBookingData,
	onNext,
	onBack,
}) {
	const dispatch = useDispatch()
	const { selectedRooms } = useSelector((state) => state.booking)
	const [rooms, setRooms] = useState([])
	const [hotel, setHotel] = useState(null)
	const [totalCapacity, setTotalCapacity] = useState(0)
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(true)
	const [numberOfNights, setNumberOfNights] = useState(0)

	useEffect(() => {
		const fetchData = async () => {
			if (
				!bookingData.groupSize ||
				!bookingData.checkInDate ||
				!bookingData.checkOutDate
			) {
				setError('Invalid selection or missing dates')
				setLoading(false)
				return
			}

			try {
				setLoading(true)
				setError(null)

				const startDate = new Date(bookingData.checkInDate)
				const endDate = new Date(bookingData.checkOutDate)
				const nights = Math.max(
					1,
					Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
				)
				setNumberOfNights(nights)

				// Fetch room inventory
				const inventoryResponse = await api.get('event/room-inventory/')
				const allInventory = inventoryResponse.data

				// Process inventory data
				const stayDates = []
				for (let i = 0; i < nights; i++) {
					const date = new Date(startDate)
					date.setDate(startDate.getDate() + i)
					stayDates.push(date.toISOString().split('T')[0])
				}

				const roomTypesMap = new Map()

				allInventory.forEach((item) => {
					if (stayDates.includes(item.stay_date)) {
						const roomTypeId = item.room_type.id
						if (!roomTypesMap.has(roomTypeId)) {
							roomTypesMap.set(roomTypeId, {
								id: roomTypeId,
								room_type_name: item.room_type.room_type_name,
								description: item.room_type.description,
								capacity: item.room_type.capacity,
								inventory: [],
							})
						}
						roomTypesMap.get(roomTypeId).inventory.push({
							stay_date: item.stay_date,
							remaining_rooms: item.remaining_rooms,
							price_per_night: parseFloat(item.price_per_night),
						})
					}
				})

				const availableRoomTypes = []
				roomTypesMap.forEach((roomType) => {
					// Check if room is available for all stay dates
					if (roomType.inventory.length === nights) {
						const min_remaining_rooms = Math.min(
							...roomType.inventory.map((inv) => inv.remaining_rooms)
						)
						const total_price_for_stay = roomType.inventory.reduce(
							(sum, inv) => sum + inv.price_per_night,
							0
						)
						const average_price_per_night = total_price_for_stay / nights

						if (min_remaining_rooms > 0) {
							availableRoomTypes.push({
								...roomType, // id, room_type_name, description, capacity
								available_rooms: min_remaining_rooms,
								price: average_price_per_night, // This is now avg price per night
								// Storing total price for convenience if needed later, or it can be calculated on the fly
								totalPriceForStay: total_price_for_stay,
							})
						}
					}
				})

				setRooms(availableRoomTypes)

				// Fetch hotel details (assuming this remains the same)
				const accommodationResponse = await api.get(
					`event/hotels/${bookingData.aId}`
				)
				setHotel(accommodationResponse.data)
			} catch (error) {
				console.error('Error fetching data:', error)
				if (error.response?.status === 404) {
					setError(
						'No rooms found for the selected criteria or dates. Please try again later.'
					)
				} else {
					setError('Failed to load data. Please try again later.')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [
		bookingData.groupSize,
		bookingData.aId,
		bookingData.checkInDate,
		bookingData.checkOutDate,
	])

	const canSelectRoom = (room) => {
		if (!bookingData.groupSize) return false

		// Get current selections for this room type
		const currentRoomSelections = selectedRooms.filter(
			(selected) => selected.room.id === room.id
		)
		const currentQuantity = currentRoomSelections.reduce(
			(sum, selection) => sum + selection.quantity,
			0
		)

		// Check if we have enough available rooms
		return currentQuantity < room.available_rooms
	}

	const handleSelectRoom = (room, quantity) => {
		const updatedSelectedRooms = [...selectedRooms]
		const existingRoomIndex = updatedSelectedRooms.findIndex(
			(selected) => selected.room.id === room.id
		)

		if (quantity > 0) {
			if (existingRoomIndex >= 0) {
				updatedSelectedRooms[existingRoomIndex].quantity = quantity
			} else {
				updatedSelectedRooms.push({ room, quantity })
			}
		} else {
			if (existingRoomIndex >= 0) {
				updatedSelectedRooms.splice(existingRoomIndex, 1)
			}
		}

		dispatch(setSelectedRooms(updatedSelectedRooms))

		// Recalculate total capacity after updating selected rooms
		const newTotalCapacity = updatedSelectedRooms.reduce(
			(sum, selection) => sum + selection.room.capacity * selection.quantity,
			0
		)
		setTotalCapacity(newTotalCapacity)
	}

	const handleQuantityChange = (room, newQuantity) => {
		if (!bookingData.groupSize) return

		const currentSelection = selectedRooms.find(
			(selected) => selected.room.id === room.id
		)
		if (!currentSelection) return

		// Calculate the new total capacity if we make this change
		const updatedSelections = selectedRooms.map((selected) =>
			selected.room.id === room.id
				? {
						...selected,
						quantity: newQuantity,
						totalCapacity: newQuantity * room.capacity,
				  }
				: selected
		)

		const newTotalCapacity = updatedSelections.reduce(
			(sum, selection) => sum + selection.room.capacity * selection.quantity,
			0
		)

		// Update both state and capacity
		dispatch(setSelectedRooms(updatedSelections))
		setTotalCapacity(newTotalCapacity)
	}

	const isRoomSelected = (room) => {
		return selectedRooms.some((r) => r.room.id === room.id)
	}

	const getRoomQuantity = (room) => {
		const selectedRoom = selectedRooms.find((r) => r.room.id === room.id)
		return selectedRoom ? selectedRoom.quantity : 0
	}

	const handleNext = () => {
		if (!bookingData.groupSize || totalCapacity < bookingData.groupSize) return

		// Create an array of room IDs with their quantities
		const roomIdsWithQuantities = selectedRooms
			.flatMap(({ room, quantity }) => Array(quantity).fill(room.id))
			.join(',')

		// Create a map of room IDs to quantities for the state
		const roomQuantities = selectedRooms.reduce((acc, { room, quantity }) => {
			acc[room.id] = quantity
			return acc
		}, {})

		setBookingData({
			...bookingData,
			selectedRooms: selectedRooms.map(({ room, quantity }) => ({
				room,
				quantity,
			})),
			roomQuantities,
			roomIdsWithQuantities,
		})
		onNext()
	}

	if (loading) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8, textAlign: 'center' }}>
					<Typography variant="h6">Loading room options...</Typography>
				</Container>
			</Box>
		)
	}

	if (error) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
					<Alert severity="error" sx={{ mb: 4 }}>
						{error}
					</Alert>
					<Button variant="contained" color="primary" onClick={onBack()}>
						Go Back
					</Button>
				</Container>
			</Box>
		)
	}

	if (!bookingData.groupSize) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
					<Alert severity="error" sx={{ mb: 4 }}>
						No group size selected. Please go back and select a group size.
					</Alert>
					<Button variant="contained" color="primary" onClick={onBack()}>
						Go Back
					</Button>
				</Container>
			</Box>
		)
	}

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Container maxWidth="xl" sx={{ pt: 6, pb: 8 }}>
				{/* Hotel Images Carousel */}
				{hotel && <Carousel images={hotel.images} alt={hotel.title} />}

				{/* Hotel Info */}
				<Box
					sx={{
						mb: 4,
						mt: 6,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
					}}
				>
					<Box>
						<Typography variant="h4" component="h1" gutterBottom>
							{hotel?.hotel_name || 'Loading...'}
						</Typography>
						<Typography color="#FFFFFF80" gutterBottom>
							{hotel?.address || 'Loading...'}
						</Typography>
						<Typography color="primary" gutterBottom>
							{bookingData.checkInDate
								? new Date(bookingData.checkInDate).toLocaleDateString(
										'en-GB',
										{
											day: 'numeric',
											month: 'short',
										}
								  )
								: ''}{' '}
							-{' '}
							{bookingData.checkOutDate
								? new Date(bookingData.checkOutDate).toLocaleDateString(
										'en-GB',
										{
											day: 'numeric',
											month: 'short',
										}
								  )
								: ''}
						</Typography>
					</Box>
					<Box>
						<Rating
							value={parseFloat(hotel?.rating) || 5}
							color={'#F821DB'}
							readOnly
							sx={{ color: '#F821DB', fontSize: '2rem' }}
						/>
					</Box>
				</Box>

				{/* Error Alert */}
				{error && (
					<Alert severity="error" sx={{ mb: 4 }}>
						{error}
					</Alert>
				)}

				<Box
					sx={{
						width: '100%',
						height: '2px',
						background: 'linear-gradient(to right, #F821 , #F821DB, #F821)',
						my: 4,
					}}
				/>

				{/* Room Options */}
				<Typography variant="h4" component="h2" gutterBottom>
					Room Options
				</Typography>
				<Typography
					variant="body1"
					color="rgba(255, 255, 255, 0.5)"
					gutterBottom
				>
					Best value based on your group size.
				</Typography>

				{/* Conditional Rendering for No Rooms Available */}
				{!loading && !error && rooms.length === 0 && (
					<Alert severity="info" sx={{ my: 4 }}>
						<Typography variant="h6" component="p" gutterBottom>
							No Rooms Available
						</Typography>
						<Typography variant="body1">
							Unfortunately, there are no rooms available for your selected
							check-in and check-out dates. Please try selecting different dates
							or contact us for further assistance.
						</Typography>
						<Button
							variant="outlined"
							color="primary"
							onClick={() => onBack()}
							sx={{ mt: 2 }}
						>
							Change Dates
						</Button>
					</Alert>
				)}

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: 'repeat(2, 1fr)',
							md: 'repeat(3, 1fr)',
						},
						gap: 4,
						width: '100%',
						maxWidth: '100%',
						pb: 12,
						mt: 2,
					}}
				>
					{rooms.map((room) => {
						const isSelected = isRoomSelected(room)
						const canSelect = canSelectRoom(room)
						const isDisabled = !canSelect && !isSelected

						return (
							<Grid item xs={12} md={6} key={room.id}>
								<Card
									sx={{
										height: '100%',
										display: 'flex',
										borderRadius: 3,
										flexDirection: 'column',
										opacity: isDisabled ? 0.6 : 1,
										'&:hover': {
											boxShadow: isDisabled ? 1 : 6,
										},
										bgcolor: 'rgba(255, 255, 255, 0.2)',
										maxWidth: '450px',
									}}
								>
									<CardContent
										sx={{
											flexGrow: 1,
											display: 'flex',
											flexDirection: 'column',
											pb: 5,
										}}
									>
										<Box
											sx={{
												height: 250,
												mb: 2,
												borderRadius: 2,
												overflow: 'hidden',
												'& img': {
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												},
											}}
										>
											<img
												src={
													// room.images[0] ??
													'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'
												}
												alt={room.room_type_name}
											/>
										</Box>
										<Box
											sx={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'flex-start',
												mb: 2,
												color: 'white',
												px: 2,
											}}
										>
											<Typography variant="h6" component="h3">
												{room.room_type_name}
											</Typography>
										</Box>
										<Typography
											variant="body2"
											color="rgba(255, 255, 255, 0.5)"
											sx={{ mb: 'auto', px: 2 }}
										>
											{room.description}
										</Typography>
										<Box sx={{ mt: 3 }}>
											<Box>
												<Typography
													variant="h5"
													color="white"
													gutterBottom
													align="center"
												>
													From ${parseFloat(room.price).toFixed(2)} USD
													<Typography
														component="span"
														variant="body2"
														color="white"
														sx={{ ml: 1 }}
													>
														/ Night
													</Typography>
												</Typography>
												<Typography
													variant="body2"
													align="center"
													color="rgba(255, 255, 255, 0.8)"
													paragraph
												>
													$
													{(parseFloat(room.price) * numberOfNights).toFixed(2)}{' '}
													USD Total for {numberOfNights} night(s)
													<br />
													(Taxes and fees included)
													{room.capacity &&
														` *Room price based on single occupancy. Total may vary.`}
												</Typography>
											</Box>
											{isSelected ? (
												<Box
													sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
												>
													<Box
														sx={{
															display: 'flex',
															alignItems: 'center',
															gap: 1,
														}}
													>
														<IconButton
															size="small"
															onClick={() =>
																handleQuantityChange(
																	room,
																	getRoomQuantity(room) - 1
																)
															}
															disabled={getRoomQuantity(room) <= 1}
														>
															<ChevronLeft size={20} />
														</IconButton>
														<Typography
															variant="body1"
															sx={{ minWidth: '2rem', textAlign: 'center' }}
														>
															{getRoomQuantity(room)}
														</Typography>
														<IconButton
															size="small"
															onClick={() =>
																handleQuantityChange(
																	room,
																	getRoomQuantity(room) + 1
																)
															}
															disabled={
																getRoomQuantity(room) >= room.available_rooms
															}
														>
															<ChevronRight size={20} />
														</IconButton>
													</Box>
													<Button
														variant="contained"
														color="error"
														onClick={() => handleSelectRoom(room, 0)}
														sx={{ flex: 1 }}
													>
														Remove
													</Button>
												</Box>
											) : (
												<Tooltip
													title={
														isDisabled
															? 'This room cannot accommodate your group size'
															: ''
													}
												>
													<span>
														<Button
															variant="contained"
															color="primary"
															fullWidth
															onClick={() => handleSelectRoom(room, 1)}
															disabled={isDisabled}
															sx={{
																mt: 2,
															}}
														>
															Select Room
														</Button>
													</span>
												</Tooltip>
											)}
										</Box>
									</CardContent>
								</Card>
							</Grid>
						)
					})}
				</Box>

				{/* Selected Rooms Summary */}
				{selectedRooms.length > 0 && (
					<Box
						sx={{
							my: 4,
							p: 3,
							bgcolor: 'rgba(255, 255, 255, 0.2)',
							borderRadius: 1,
							boxShadow: 1,
						}}
					>
						<Typography variant="h6" gutterBottom>
							Selected Rooms
						</Typography>
						{selectedRooms.map(({ room, quantity }) => (
							<Box
								key={room.id}
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									py: 1,
								}}
							>
								<Typography>
									{room.room_type_name} × {quantity}
								</Typography>
								<Typography>
									${(room.price * quantity * numberOfNights).toFixed(2)}
								</Typography>
							</Box>
						))}
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								mt: 2,
								pt: 2,
								borderTop: '2px solid',
								borderColor: 'divider',
							}}
						>
							<Typography variant="h6">Total Amount</Typography>
							<Typography variant="h6" color="primary">
								$
								{selectedRooms
									.reduce(
										(sum, { room, quantity }) =>
											sum + room.price * quantity * numberOfNights,
										0
									)
									.toFixed(2)}
							</Typography>
						</Box>
					</Box>
				)}

				{/* Sticky Footer with Group Size Info */}
				<Box
					sx={{
						position: 'fixed',
						bottom: 0,
						left: 0,
						right: 0,
						bgcolor: 'background.paper',
						p: 2,
						boxShadow: 3,
						zIndex: 1000,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						px: { xs: 2, md: 4 },
					}}
				>
					<Box>
						<Typography variant="h6" gutterBottom>
							Group Size: {bookingData.groupSize} people
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Selected capacity: {totalCapacity} people
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						{totalCapacity < bookingData.groupSize ? (
							<Alert severity="warning" sx={{ mb: 0 }}>
								Minimum {bookingData.groupSize - totalCapacity} more people need
								accommodation
							</Alert>
						) : (
							<Alert severity="success" sx={{ mb: 0 }}>
								Minimum capacity requirement met
							</Alert>
						)}
						<Button
							variant="contained"
							color="primary"
							size="large"
							onClick={handleNext}
							disabled={totalCapacity < bookingData.groupSize}
						>
							Continue to Add-ons
						</Button>
					</Box>
				</Box>
			</Container>
		</Box>
	)
}
