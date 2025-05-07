import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'

import { store } from './store'
import { Provider } from 'react-redux'

import EventDetails from './pages/EventDetails'

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
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<GlobalStyles styles={globalStyles} />
			<Routes>
				<Route path="/" element={<EventDetails />} />
				<Route path="/verify-email/:token" element={<VerifyEmail />} />
				<Route
					path="/events/:eventId/packages"
					element={<Navigate to="/events/:eventId" replace />}
				/>
				<Route path="/events/booking/" element={<BookingStepper />} />
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
