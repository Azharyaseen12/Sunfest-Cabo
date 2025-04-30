import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	eventId: null,
	packageId: null,
	groupSize: null,
	hotel: {
		id: null,
		name: null,
	},
	selectedRooms: [], // Array of { room, quantity } objects
	roomQuantities: {}, // Map of roomId to quantity
	addons: [],
	dates: {
		checkIn: null,
		checkOut: null,
		nights: null,
	},
	pricing: {
		subtotal: 0,
		taxesAndFees: 0,
		total: 0,
	},
}

export const bookingSlice = createSlice({
	name: 'booking',
	initialState,
	reducers: {
		setEventDetails: (state, action) => {
			const { eventId, packageId } = action.payload
			state.eventId = eventId
			state.packageId = packageId
		},
		setGroupSize: (state, action) => {
			state.groupSize = action.payload
		},
		setHotel: (state, action) => {
			state.hotel = action.payload
		},
		setSelectedRooms: (state, action) => {
			state.selectedRooms = action.payload
			// Update roomQuantities map
			state.roomQuantities = action.payload.reduce(
				(acc, { room, quantity }) => {
					acc[room.id] = quantity
					return acc
				},
				{}
			)
		},
		addAddon: (state, action) => {
			state.addons.push(action.payload)
		},
		removeAddon: (state, action) => {
			state.addons = state.addons.filter((addon) => addon.id !== action.payload)
		},
		setDates: (state, action) => {
			state.dates = action.payload
		},
		setPricing: (state, action) => {
			state.pricing = action.payload
		},
		resetBooking: () => {
			return initialState
		},
	},
})

export const {
	setEventDetails,
	setGroupSize,
	setHotel,
	setSelectedRooms,
	addAddon,
	removeAddon,
	setDates,
	setPricing,
	resetBooking,
} = bookingSlice.actions

export default bookingSlice.reducer
