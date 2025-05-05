import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
	Box,
	Container,
	Typography,
	Button,
	Breadcrumbs,
	Card,
	CardContent,
	CardMedia,
	Chip,
	IconButton,
	Alert,
	CircularProgress,
	Grid,
	List,
	ListItem,
	ListItemText,
} from '@mui/material'
import { ChevronRight, EditIcon, DeleteIcon } from 'lucide-react'
import AddOnDetailsDialog from '../components/AddOnDetailsDialog'
import api from '../utils/api'

export default function AddOnSelection({eventId, event_date_id,bookingData,setBookingData,onNext}) {
	const [addOns, setAddOns] = useState([])
	const [selectedAddOns, setSelectedAddOns] = useState([])
	const [dialogOpen, setDialogOpen] = useState(false)
	const [selectedAddon, setSelectedAddon] = useState(null)
	const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
	const [quantity, setQuantity] = useState(1)
	const [dialogError, setDialogError] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchAddOns = async () => {
			try {
				setLoading(true)

				// First fetch the event date to get the actual date
				const eventDateResponse = await api.get(
					`/events/event-dates/${event_date_id}`
				)
				const eventDate = new Date(eventDateResponse.data.date)
				const formattedDate = eventDate.toISOString().split('T')[0] // Format as YYYY-MM-DD

				const response = await api.get(`/events/add-ons/?event_id=${eventId}`)
				const addOnsWithAvailability = await Promise.all(
					response.data.map(async (addon) => {
						const availabilityResponse = await api.get(
							`/events/add-ons/${addon.id}/availability/?event_id=${eventId}&date=${formattedDate}`
						)
						return {
							...addon,
							availableTickets: availabilityResponse.data.available_tickets,
							timeSlots: addon.has_time_slots
								? await Promise.all(
										addon.time_slots.map(async (slot) => {
											const slotAvailabilityResponse = await api.get(
												`/events/add-ons/${addon.id}/time-slots/${slot.id}/availability/?event_id=${eventId}&date=${formattedDate}`
											)
											return {
												...slot,
												availableCapacity:
													slotAvailabilityResponse.data.available_capacity,
											}
										})
								  )
								: [],
						}
					})
				)
				setAddOns(addOnsWithAvailability)
				setError(null)
			} catch (err) {
				setError('Failed to load add-ons. Please try again later.')
				console.error('Error fetching add-ons:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchAddOns()
	}, [eventId, event_date_id])

	const handleAddItem = (addon) => {
		setSelectedAddon(addon)
		setSelectedTimeSlot(null)
		setQuantity(1)
		setDialogError('')
		setDialogOpen(true)
	}

	const handleCloseDialog = () => {
		setDialogOpen(false)
		setSelectedAddon(null)
		setSelectedTimeSlot(null)
		setQuantity(1)
		setDialogError('')
	}

	const handleAddToBooking = (selectedTimeSlots) => {
		if (!selectedAddon) return

		const newSelection = {
			addOn: selectedAddon,
			timeSlots: selectedTimeSlots,
			totalPrice: selectedTimeSlots.reduce((total, slot) => {
				return total + slot.quantity * slot.price
			}, 0),
		}

		setSelectedAddOns((prev) => [...prev, newSelection])
		handleCloseDialog()
	}

	const handleRemoveSelection = (index) => {
		setSelectedAddOns((prev) => prev.filter((_, i) => i !== index))
	}

	const getTotalPrice = () => {
		return selectedAddOns.reduce(
			(total, selection) => total + selection.totalPrice,
			0
		)
	}

	const handleNext = () => {
		setBookingData({
			...bookingData,
			selectedAddOns: selectedAddOns.map((item) => ({
				addOn: item.addOn,
				timeSlots: item.timeSlots,
				quantity: item.timeSlots.reduce(
					(sum, slot) => sum + slot.quantity,
					0
				),
				totalPrice: item.totalPrice,
			})),
		})
		onNext();
	}

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
				<CircularProgress />
			</Box>
		)
	}

	if (error) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
				<Typography color="error">{error}</Typography>
			</Box>
		)
	}

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
				{/* Main Content */}
				<Typography variant="h3" component="h1" gutterBottom>
					Choose Your Add-ons
				</Typography>

				{/* Available Add-ons Grid */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: 'repeat(2, 1fr)',
							md: 'repeat(3, 1fr)',
						},
						gap: 3,
						width: '100%',
						maxWidth: '100%',
						pb: 8, // Add padding at bottom to account for sticky footer
					}}
				>
					{addOns.map((addon) => {
						const selections = selectedAddOns.filter(
							(selected) => selected.addOn.id === addon.id
						)
						const isSelected = selections.length > 0
						const availableTickets = addon.availableTickets

						return (
							<Card
								key={addon.id}
								sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									bgcolor: isSelected
										? 'rgba(210, 105, 30, 0.4)'
										: 'rgba(255, 255, 255, 0.1)',
									border: isSelected ? '2px solid' : 'none',
									borderColor: 'primary.main',
									'&:hover': {
										boxShadow: 6,
									},
								}}
							>
								<CardMedia
									component="img"
									image={addon.image}
									alt={addon.title}
									sx={{
										height: 240,
										objectFit: 'cover',
									}}
								/>
								<CardContent
									sx={{
										flexGrow: 1,
										display: 'flex',
										flexDirection: 'column',
									}}
								>
									<Typography
										variant="h5"
										component="h2"
										color="white"
										gutterBottom
									>
										{addon.title}
									</Typography>
									<Typography
										variant="body2"
										color="rgba(255, 255, 255, 0.8)"
										sx={{ mb: 'auto' }}
									>
										{addon.description}
									</Typography>
									<Box sx={{ mt: 3 }}>
										<Typography
											variant="h6"
											color="primary.main"
											align="center"
											gutterBottom
										>
											From ${parseFloat(addon.price).toFixed(2)} USD
											<Typography
												component="span"
												variant="body2"
												color="text.secondary"
												sx={{ ml: 1 }}
											>
												/ Person
											</Typography>
										</Typography>

										{/* Show selections if any exist */}
										{isSelected && (
											<Box sx={{ mb: 2 }}>
												{selections.map((selection, index) => (
													<Box
														key={index}
														sx={{
															display: 'flex',
															justifyContent: 'space-between',
															alignItems: 'center',
															mb: 1,
															p: 1,
															bgcolor: 'background.paper',
															borderRadius: 1,
														}}
													>
														<Box>
															<Typography variant="body2" color="text.primary">
																Quantity: {selection.timeSlots.length}
															</Typography>
															{addon.has_time_slots && (
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	Time Slots:{' '}
																	{selection.timeSlots
																		.map((slot) => slot.id)
																		.join(', ')}
																</Typography>
															)}
														</Box>
														<Box>
															<IconButton
																size="small"
																onClick={() => handleRemoveSelection(index)}
															>
																<DeleteIcon />
															</IconButton>
														</Box>
													</Box>
												))}
											</Box>
										)}

										<Button
											variant="contained"
											color="primary"
											fullWidth
											onClick={() => handleAddItem(addon)}
											disabled={availableTickets <= 0}
										>
											{isSelected ? 'Add Another' : 'Add Item'}
										</Button>
									</Box>
								</CardContent>
							</Card>
						)
					})}
				</Box>

				{/* Sticky Footer */}
				<Box
					sx={{
						position: 'fixed',
						bottom: 0,
						left: 0,
						right: 0,
						bgcolor: 'background.paper',
						boxShadow: 3,
						p: 2,
						zIndex: 1000,
					}}
				>
					<Container maxWidth="xl">
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							{selectedAddOns.length > 0 ? (
								<>
									<Typography variant="h6">
										Total: ${getTotalPrice().toFixed(2)} USD
									</Typography>
									<Button
										variant="contained"
										color="primary"
										onClick={handleNext}
										size="large"
									>
										Continue to Review
									</Button>
								</>
							) : (
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										justifyContent: 'flex-end',
									}}
								>
									<Button
										variant="outlined"
										color="primary"
										onClick={handleNext}
										size="large"
									>
										Skip Add-ons
									</Button>
								</Box>
							)}
						</Box>
					</Container>
				</Box>

				{/* Add-on Details Dialog */}
				<AddOnDetailsDialog
					open={dialogOpen}
					onClose={handleCloseDialog}
					addOn={selectedAddon}
					selectedTimeSlot={selectedTimeSlot}
					setSelectedTimeSlot={setSelectedTimeSlot}
					quantity={quantity}
					setQuantity={setQuantity}
					error={dialogError}
					setError={setDialogError}
					onAddToBooking={handleAddToBooking}
				/>
			</Container>
		</Box>
	)
}
