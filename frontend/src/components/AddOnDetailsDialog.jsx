import React, { useState, useEffect } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	IconButton,
	CardMedia,
	Divider,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
} from '@mui/material'
import { X as CloseIcon, Plus, Minus, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function AddOnDetailsDialog({
	open,
	onClose,
	addOn,
	onAddToBooking,
	error,
	setError,
}) {
	const [selectedTimeSlots, setSelectedTimeSlots] = useState([])

	useEffect(() => {
		// Reset selections when dialog opens/closes
		if (!open) {
			setSelectedTimeSlots([])
		}
	}, [open])

	const handleClose = () => {
		setSelectedTimeSlots([])
		onClose()
	}

	const handleAddToBooking = () => {
		if (selectedTimeSlots.length === 0) {
			setError('Please select at least one time slot')
			return
		}
		onAddToBooking(selectedTimeSlots)
		handleClose()
	}

	const handleTimeSlotQuantityChange = (timeSlot, increment) => {
		const currentSlotIndex = selectedTimeSlots.findIndex(
			(item) => item.timeSlotId === timeSlot.id
		)

		if (currentSlotIndex === -1 && increment > 0) {
			// Add new time slot selection
			setSelectedTimeSlots([
				...selectedTimeSlots,
				{
					timeSlotId: timeSlot.id,
					quantity: 1,
					price: timeSlot.price_override || addOn.price,
					start_time: timeSlot.start_time,
					end_time: timeSlot.end_time,
				},
			])
		} else if (currentSlotIndex !== -1) {
			const newQuantity =
				selectedTimeSlots[currentSlotIndex].quantity + increment
			if (newQuantity <= 0) {
				// Remove time slot if quantity becomes 0
				setSelectedTimeSlots(
					selectedTimeSlots.filter((_, index) => index !== currentSlotIndex)
				)
			} else if (newQuantity <= timeSlot.available_capacity) {
				// Update quantity if within limits
				const newTimeSlots = [...selectedTimeSlots]
				newTimeSlots[currentSlotIndex] = {
					...selectedTimeSlots[currentSlotIndex],
					quantity: newQuantity,
				}
				setSelectedTimeSlots(newTimeSlots)
			}
		}
	}

	const getTimeSlotQuantity = (timeSlotId) => {
		const selectedSlot = selectedTimeSlots.find(
			(slot) => slot.timeSlotId === timeSlotId
		)
		return selectedSlot ? selectedSlot.quantity : 0
	}

	const getTotalPrice = () => {
		return selectedTimeSlots.reduce((total, slot) => {
			return total + slot.quantity * slot.price
		}, 0)
	}

	if (!addOn) return null

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					bgcolor: 'background.paper',
				},
			}}
		>
			<DialogTitle
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					p: 2,
				}}
			>
				<Typography variant="h6">{addOn.title}</Typography>
				<IconButton onClick={handleClose} size="small">
					<CloseIcon size={20} />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers>
				<Box sx={{ mb: 3 }}>
					<CardMedia
						component="img"
						image={addOn.image}
						alt={addOn.title}
						sx={{
							height: 300,
							width: '100%',
							objectFit: 'cover',
							borderRadius: 1,
						}}
					/>
				</Box>

				<Typography variant="body1" paragraph>
					{addOn.description}
				</Typography>

				{error && (
					<Typography color="error" sx={{ mb: 2 }}>
						{error}
					</Typography>
				)}

				{/* Available Time Slots */}
				<Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
					Available Time Slots
				</Typography>
				<List>
					{addOn.time_slots?.map((timeSlot) => (
						<ListItem
							key={timeSlot.id}
							sx={{
								bgcolor: 'background.paper',
								mb: 1,
								borderRadius: 1,
								border: '1px solid',
								borderColor: 'divider',
								opacity: timeSlot.available_capacity <= 0 ? 0.5 : 1,
								pointerEvents:
									timeSlot.available_capacity <= 0 ? 'none' : 'auto',
							}}
						>
							<ListItemText
								primary={
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Clock size={16} />
										<Typography>
											{format(new Date(timeSlot.start_time), 'h:mm a')} -{' '}
											{format(new Date(timeSlot.end_time), 'h:mm a')}
										</Typography>
									</Box>
								}
								secondary={
									<>
										<Typography
											variant="body2"
											color={
												timeSlot.available_capacity <= 0
													? 'error'
													: 'text.secondary'
											}
										>
											{timeSlot.available_capacity <= 0
												? 'No spots available'
												: `${timeSlot.available_capacity} spots available`}
										</Typography>
										{timeSlot.price_override && (
											<Typography variant="body2" color="primary">
												Special Price: ${timeSlot.price_override} USD
											</Typography>
										)}
									</>
								}
							/>
							<ListItemSecondaryAction>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<IconButton
										size="small"
										onClick={() => handleTimeSlotQuantityChange(timeSlot, -1)}
										disabled={
											getTimeSlotQuantity(timeSlot.id) === 0 ||
											timeSlot.available_capacity <= 0
										}
									>
										<Minus size={16} />
									</IconButton>
									<Typography
										variant="body1"
										sx={{ minWidth: '2rem', textAlign: 'center' }}
									>
										{getTimeSlotQuantity(timeSlot.id)}
									</Typography>
									<IconButton
										size="small"
										onClick={() => handleTimeSlotQuantityChange(timeSlot, 1)}
										disabled={
											getTimeSlotQuantity(timeSlot.id) >=
												timeSlot.available_capacity ||
											timeSlot.available_capacity <= 0
										}
									>
										<Plus size={16} />
									</IconButton>
								</Box>
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>

				{/* Selected Time Slots Summary */}
				{selectedTimeSlots.length > 0 && (
					<Box sx={{ mt: 3 }}>
						<Divider />
						<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
							Selected Time Slots
						</Typography>
						<List>
							{selectedTimeSlots.map((slot, index) => (
								<ListItem
									key={index}
									sx={{
										bgcolor: 'background.default',
										mb: 1,
										borderRadius: 1,
									}}
								>
									<ListItemText
										primary={
											<Box
												sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
											>
												<Clock size={16} />
												<Typography>
													{format(new Date(slot.start_time), 'h:mm a')} -{' '}
													{format(new Date(slot.end_time), 'h:mm a')}
												</Typography>
											</Box>
										}
										secondary={`${slot.quantity} ${
											slot.quantity === 1 ? 'spot' : 'spots'
										} - $${(slot.quantity * slot.price).toFixed(2)} USD`}
									/>
									<ListItemSecondaryAction>
										<IconButton
											edge="end"
											onClick={() =>
												setSelectedTimeSlots(
													selectedTimeSlots.filter((_, i) => i !== index)
												)
											}
										>
											<Trash2 size={16} />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
							))}
						</List>
						<Box
							sx={{
								mt: 2,
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Typography variant="subtitle1">Total Amount:</Typography>
							<Typography variant="h6" color="primary">
								${getTotalPrice().toFixed(2)} USD
							</Typography>
						</Box>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={handleClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={handleAddToBooking}
					disabled={selectedTimeSlots.length === 0}
				>
					Add to Booking
				</Button>
			</DialogActions>
		</Dialog>
	)
}
