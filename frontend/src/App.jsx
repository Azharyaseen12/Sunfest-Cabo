import { useEffect, useState } from 'react'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'

import { store } from './store'
import { Provider } from 'react-redux'
import { useDispatch } from 'react-redux'
import { checkAuth } from './store/slices/AuthSlice'

import EventDetails from './pages/EventDetails'
import PackageSelection from './pages/PackageSelection'
import GroupSizeSelection from './pages/GroupSizeSelection'
import AccommodationSelection from './pages/AccommodationSelection'
import RoomSelection from './pages/RoomSelection'
import AddOnSelection from './pages/AddOnSelection'
import ReviewPackage from './pages/ReviewPackage'

import api from './utils/api'

import BookingSuccess from './pages/BookingSuccess'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'

import VerifyEmail from './components/VerifyEmail'
import GoogleAuthHandler from './components/GoogleAuthHandler'
import FacebookAuthHandler from './components/FacebookAuthHandler'
import Footer from './components/Footer'
import BookingStepper from './pages/BookingStepper'

// Create a theme instance
const theme = createTheme({
	palette: {
		primary: {
			main: '#F821DB',
			light: '#ff5cff',
			dark: '#c000a8',
		},
		secondary: {
			main: '#1a237e',
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: 8,
				},
			},
		},
	},
})

const globalStyles = {
	'html, body, #root': {
		height: '100% !important',
		width: '100% !important',
		margin: '0 !important',
		padding: '0 !important',
	},
	body: {
		backgroundImage: 'url(/bg.svg) !important',
		backgroundSize: 'cover !important',
		backgroundPosition: 'center !important',
		backgroundRepeat: 'no-repeat !important',
		backgroundAttachment: 'fixed !important',
		minHeight: '100vh !important',
		backgroundColor: 'transparent !important',
	},
	'*': {
		boxSizing: 'border-box !important',
	},
}

// Create a separate component for the app content
function AppContent() {
	const [firstEventId, setFirstEventId] = useState(null)
	const dispatch = useDispatch()

	useEffect(() => {
		// Check auth status on app load
		dispatch(checkAuth())

		const fetchFirstEvent = async () => {
			try {
				const response = await api.get('events/events')
				if (response.data && response.data.length > 0) {
					setFirstEventId(response.data[0].id)
				}
			} catch (error) {
				console.error('Error fetching first event:', error)
			}
		}

		fetchFirstEvent()
	}, [dispatch])

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<GlobalStyles styles={globalStyles} />
			<Routes>
				<Route
					path="/"
					element={
						firstEventId ? (
							<Navigate to={`/events/${firstEventId}`} replace />
						) : (
							<div>Loading...</div>
						)
					}
				/>
				<Route path="/events/:eventId" element={<EventDetails />} />
				<Route path="/verify-email/:token" element={<VerifyEmail />} />
				<Route
					path="/events/:eventId/packages"
					element={<Navigate to="/events/:eventId" replace />}
				/>
				<Route
					path="/events/:eventId/packages/:event_date_id"
					element={<PackageSelection />}
				/>
				<Route
					path="/events/:eventId/packages/:event_date_id/plane/:packageId/group-size"
					element={<GroupSizeSelection />}
				/>
				<Route
					path="/events/:eventId/packages/:event_date_id/plane/:packageId/group-size/:groupSize/accommodation"
					element={<AccommodationSelection />}
				/>
				<Route
					path="/events/:eventId/packages/:event_date_id/plane/:packageId/group-size/:groupSize/accommodation/:aId/rooms"
					element={<RoomSelection />}
				/>
				<Route
					path="/events/:eventId/packages/:event_date_id/plane/:packageId/group-size/:groupSize/accommodation/:aId/rooms/:roomId/add-ons"
					element={<AddOnSelection />}
				/>
				<Route
					path="/events/:eventId/packages/:event_date_id/plane/:packageId/group-size/:groupSize/accommodation/:aId/rooms/:roomIds/review"
					element={<ReviewPackage />}
				
				/>
				<Route 
					path="/events/:eventId/packages/:event_date_id/plane/:packageId/booking/:step" 
					element={<BookingStepper />} 
					/>
				<Route 
					path="/events/:eventId/packages/:event_date_id/booking/:step" 
					element={<BookingStepper />} 
					/>
				<Route path="/booking-success" element={<BookingSuccess />} />
				<Route path="/booking/success" element={<PaymentSuccess />} />
				<Route path="/booking/cancel" element={<PaymentCancel />} />
				<Route path="/about" element={<div>About Page Coming Soon</div>} />

				<Route path="/auth/google/callback" element={<GoogleAuthHandler />} />
				<Route
					path="/auth/facebook/callback"
					element={<FacebookAuthHandler />}
				/>
			</Routes>
			<Footer />
		</ThemeProvider>
	)
}

// Main App component that provides the Redux store
function App() {
	return (
		<Provider store={store}>
			<AppContent />
		</Provider>
	)
}

export default App
