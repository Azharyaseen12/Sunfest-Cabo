import { configureStore } from '@reduxjs/toolkit'
import bookingReducer from './slices/bookingSlice';
import authReducers from './slices/AuthSlice'

export const store = configureStore({
	reducer: {
		auth: authReducers,
		booking: bookingReducer,
	},
})
