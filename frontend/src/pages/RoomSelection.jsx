import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
	Box,
	Container,
	Typography,
	Button,
	Breadcrumbs,
	Card,
	CardMedia,
	CardContent,
	Rating,
	IconButton,
	Chip,
	Tooltip,
	Alert,
	Grid,
} from '@mui/material'
import {
	ChevronRight,
	ChevronLeft,
	ChevronRight as ChevronRightIcon,
} from 'lucide-react'
import Header from '../components/Header'
import api from '../utils/api'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedRooms } from '../store/slices/bookingSlice'

const Carousel = ({ alt }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const defaultImage =
		'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=1974&auto=format&fit=crop'
	const displayImages = [{ image: defaultImage }]

	// const displayImages = images.length > 0 ? images : [{ image: defaultImage }]

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
			<Box sx={{
				 	height : '100%' ,
					width: '100%',
				  	display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 3,
					}}>
			<img
				src={displayImages[currentIndex].image}
				alt={alt}
				style={{
					width: '60%',
					height: '100%',
					transition: 'opacity 0.3s ease-in-out',
					borderRadius: "20px",
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
					borderRadius: "20px",
					objectFit: 'cover',
				}}
			/>
			<Box sx={{ display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 3,
				height: '100%',
				flexDirection: 'column',
				width: '15%',
				}}>
			<img
				src={displayImages[currentIndex].image}
				alt={alt}
				style={{
					width: '100%',
					height: '100%',
					transition: 'opacity 0.3s ease-in-out',
					borderRadius: "20px",
				}}
			/>
			<img
				src={displayImages[currentIndex].image}
				alt={alt}
				style={{
					width: '100%',
					height: '100%',
					transition: 'opacity 0.3s ease-in-out',
					borderRadius: "20px",
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

export default function RoomSelection({bookingData, setBookingData , onNext}) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { selectedRooms } = useSelector((state) => state.booking)
	const [rooms, setRooms] = useState([])
	const [hotel, setHotel] = useState(null)
	const [totalCapacity, setTotalCapacity] = useState(0)
	const [error, setError] = useState(null)
	const [groupSizeData, setGroupSizeData] = useState(null)
	const [loading, setLoading] = useState(true)
	const checkInDate = new Date(bookingData.checkInDate);
	const checkOutDate = new Date(bookingData.checkOutDate);

	useEffect(() => {
		const fetchData = async () => {
			if (!bookingData.groupSize || !checkInDate || !checkOutDate) {
				setError('Invalid selection or missing dates')
				setLoading(false)
				return
			}

			try {
				setLoading(true)
				setError(null)

				// Fetch group size details
				const groupSizeResponse = await api.get(
					`events/group-sizes/${bookingData.groupSize}`
				)
				if (!groupSizeResponse.data) {
					throw new Error('Group size not found')
				}
				setGroupSizeData(groupSizeResponse.data)

				// Fetch rooms with date availability
				const roomsResponse = await api.get(
					`events/rooms?accommodation_id=${bookingData.aId}&check_in=${checkInDate.toISOString()}&check_out=${checkOutDate.toISOString()}`
				)
				setRooms(roomsResponse.data)
				if (roomsResponse.data.length > 0) {
					setHotel(roomsResponse.data[0].accommodation)
				}
			} catch (error) {
				console.error('Error fetching data:', error)
				if (error.response?.status === 404) {
					setError('Group size not found. Please select a valid group size.')
				} else {
					setError('Failed to load data. Please try again later.')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [bookingData.groupSize, bookingData.aId, bookingData.checkInDate, bookingData.checkOutDate])

	const canSelectRoom = (room) => {
		if (!groupSizeData) return false

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
	}

	const handleQuantityChange = (room, newQuantity) => {
		if (!groupSizeData) return

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
		if (!groupSizeData || totalCapacity < groupSizeData.number_of_persons)
			return

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
		onNext();
	}

	if (loading) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Header />
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8, textAlign: 'center' }}>
					<Typography variant="h6">Loading room options...</Typography>
				</Container>
			</Box>
		)
	}

	if (error) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Header />
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
					<Alert severity="error" sx={{ mb: 4 }}>
						{error}
					</Alert>
					<Button
						variant="contained"
						color="primary"
						onClick={() => navigate(-1)}
					>
						Go Back
					</Button>
				</Container>
			</Box>
		)
	}

	if (!groupSizeData) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Header />
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
					<Alert severity="error" sx={{ mb: 4 }}>
						No group size selected. Please go back and select a group size.
					</Alert>
					<Button
						variant="contained"
						color="primary"
						onClick={() => navigate(-1)}
					>
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
							{hotel?.title || 'Loading...'}
						</Typography>
						<Typography color="#FFFFFF80" gutterBottom>
							3325 S Las Vegas Blvd, Las Vegas, NV 89109
						</Typography>
						<Typography color="primary" gutterBottom>
							{bookingData.checkInDate
								? new Date(bookingData.checkInDate).toLocaleDateString('en-GB', {
										day: 'numeric',
										month: 'short',
								  })
								: ''}{' '}
							-{' '}
							{bookingData.checkOutDate
								? new Date(bookingData.checkOutDate).toLocaleDateString('en-GB', {
										day: 'numeric',
										month: 'short',
								  })
								: ''}
						</Typography>
						{/* <Box
							sx={{
								p: 2,
								bgcolor: 'transparent',
								borderRadius: 1,
								boxShadow: 1,
								display: 'flex',
								gap: 2,
								alignItems: 'center',
							}}
						>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									gap: 0.5,
								}}
							>
								<Typography variant="caption" color="white">
									Check-in
								</Typography>
								<input
									type="date"
									value={checkInDate?.toISOString().split('T')[0] || ''}
									disabled
									style={{
										width: '150px',
										padding: '8px',
										border: '1px solid #ccc',
										borderRadius: '4px',
										backgroundColor: 'transparent',
										cursor: 'not-allowed',
									}}
								/>
							</Box>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
								<Typography variant="caption" color="white">
									Check-out
								</Typography>
								<input
									type="date"
									value={checkOutDate?.toISOString().split('T')[0] || ''}
									disabled
									style={{
										width: '150px',
										padding: '8px',
										border: '1px solid #ccc',
										borderRadius: '4px',
										backgroundColor: 'transparent',
										cursor: 'not-allowed',
									}}
								/>
							</Box>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
								<Typography variant="caption" color="white">
									Nights
								</Typography>
								<input
									type="text"
									value={nights}
									disabled
									style={{
										width: '60px',
										padding: '8px',
										border: '1px solid #ccc',
										borderRadius: '4px',
										backgroundColor: 'transparent',
										cursor: 'not-allowed',
										textAlign: 'center',
									}}
								/>
							</Box> 
						</Box>*/}
					</Box>
					<Box>
						<Rating
							value={hotel?.rating || 5}
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
					Room Bundle for 2
				</Typography>
				<Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
					Best value based on your group size.
				</Typography>

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
												alt={room.title}
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
												{room.title}
											</Typography>
											{/* <Box
												sx={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'flex-end',
													gap: 1,
												}}
											>
												<Chip
													label={`Capacity: ${room.capacity} people`}
													color={isSelected ? 'primary' : 'default'}
													size="small"
												/>
												<Chip
													label={`Available: ${room.available_rooms} rooms`}
													color={room.available_rooms > 0 ? 'success' : 'error'}
													size="small"
												/>
												<Chip
													label={`Bed: ${room.bed_type}`}
													color="default"
													size="small"
												/>
											</Box> */}
										</Box>
										<Typography
											variant="body2"
											color="rgba(255, 255, 255, 0.5)"
											sx={{ mb: 'auto'  , px: 2 }}
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
														/ Person
													</Typography>
												</Typography>
												<Typography
													variant="body2"
													align="center"
													color="rgba(255, 255, 255, 0.8)"
													paragraph
												>
													${parseFloat(room.price * 2).toFixed(2)} USD Total
													(Taxes and fees included)
													<br />
													*Price shown based on 2 people
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
									borderBottom: '1px solid',
									borderColor: 'divider',
								}}
							>
								<Typography>
									{room.title} × {quantity}
								</Typography>
								<Typography>${(room.price * quantity).toFixed(2)}</Typography>
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
										(sum, { room, quantity }) => sum + room.price * quantity,
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
							Group Size: {groupSizeData.number_of_persons} people
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Selected capacity: {totalCapacity} people
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						{totalCapacity < groupSizeData.number_of_persons ? (
							<Alert severity="warning" sx={{ mb: 0 }}>
								Minimum {groupSizeData.number_of_persons - totalCapacity} more
								people need accommodation
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
							disabled={totalCapacity < groupSizeData.number_of_persons}
						>
							Continue to Add-ons
						</Button>
					</Box>
				</Box>
			</Container>
		</Box>
	)
}
