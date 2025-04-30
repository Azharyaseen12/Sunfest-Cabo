import { useNavigate, useSearchParams } from 'react-router'
import {
	Box,
	Container,
	Typography,
	Button,
	Card,
	CardContent,
	Divider,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	CircularProgress,
} from '@mui/material'
import { CheckCircle } from 'lucide-react'
import Header from '../components/Header'
import api from '../utils/api'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your public key
const stripePromise = loadStripe(
	import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'not_found'
)

export default function BookingSuccess() {
	const [searchParams] = useSearchParams()
	const bookingId = searchParams.get('booking_id')
	const sessionId = searchParams.get('session_id')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [bookingDetails, setBookingDetails] = useState(null)
	const [processingPayment, setProcessingPayment] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const fetchBookingDetails = async () => {
			try {
				if (!bookingId && !sessionId) {
					throw new Error('No booking or session ID found')
				}

				let response

				// If we have a session ID, fetch payment details
				if (sessionId) {
					response = await api.get(`payments/session/${sessionId}/`)
				} else {
					// Otherwise fetch booking details directly
					response = await api.get(`events/bookings/${bookingId}/`)
				}

				const booking = sessionId ? response.data.booking : response.data

				// Ensure all properties have default values to prevent undefined errors
				setBookingDetails({
					id: booking.id,
					event: booking.event_date?.event || {},
					pricingPlan: booking.pricing_plan || {},
					accommodation: booking.hotel_booking?.accommodation || {},
					rooms: booking.rooms || [],
					addOns: booking.add_ons || [],
					groupSize: booking.group_size || {},
					totalPrice: parseFloat(booking.total_price || 0),
					checkInDate: booking.hotel_booking?.check_in_date || new Date(),
					checkOutDate: booking.hotel_booking?.check_out_date || new Date(),
					nights: booking.hotel_booking?.nights || 0,
					isPaid: booking.is_paid || false,
				})
			} catch (error) {
				console.error('Error fetching booking details:', error)
				setError('Failed to load booking details. Please try again.')
				toast.error('Failed to load booking details. Please try again.')
			} finally {
				setLoading(false)
			}
		}

		fetchBookingDetails()
	}, [bookingId, sessionId])

	const handleProceedToPayment = async () => {
		try {
			setProcessingPayment(true)

			// Create Stripe checkout session
			const paymentResponse = await api.post(
				`payments/checkout-session/${bookingDetails.id}/`,
				{
					success_url: `${window.location.origin}/payment-success`,
					cancel_url: `${window.location.origin}/payment-cancel`,
				}
			)
			const { session_id } = paymentResponse.data

			if (!session_id) {
				throw new Error('No session ID received from server')
			}

			// Get Stripe instance
			const stripe = await stripePromise

			// Redirect to Stripe checkout using the JS SDK
			const { error } = await stripe.redirectToCheckout({
				sessionId: session_id,
			})

			if (error) {
				console.error('Stripe redirect error:', error)
				throw new Error(error.message)
			}
		} catch (error) {
			console.error('Error creating payment session:', error)
			setError('Failed to create payment session. Please try again.')
			toast.error('Failed to create payment session. Please try again.')
			setProcessingPayment(false)
		}
	}

	if (loading) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Header />
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8, textAlign: 'center' }}>
					<CircularProgress />
					<Typography variant="h6" sx={{ mt: 2 }}>
						Loading booking details...
					</Typography>
				</Container>
			</Box>
		)
	}

	if (error || !bookingDetails) {
		return (
			<Box className="min-h-screen bg-transparent text-white">
				<Header />
				<Container maxWidth="xl" sx={{ pt: 12, pb: 8, textAlign: 'center' }}>
					<Typography variant="h5" color="error">
						{error || 'Invalid booking details'}
					</Typography>
					<Button
						variant="contained"
						color="primary"
						onClick={() => navigate('/')}
						sx={{ mt: 2 }}
					>
						Return Home
					</Button>
				</Container>
			</Box>
		)
	}
	const { totalPrice, isPaid } = bookingDetails

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Header />
			<Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
				<Card
					sx={{
						bgcolor: 'rgba(255, 255, 255, 0.2)',
						borderRadius: 3,
						p: 3,
						mb: 4,
					}}
				>
					<CardContent>
						<Box sx={{ textAlign: 'center', mb: 4 }}>
							<CheckCircle size={64} color="#4CAF50" />
							<Typography variant="h4" sx={{ mt: 2 }}>
								Booking Confirmed!
							</Typography>
							<Typography variant="subtitle1" sx={{ mt: 1 }}>
								{isPaid
									? 'Your payment has been processed successfully'
									: 'Your booking has been created successfully. Please proceed to payment.'}
							</Typography>
						</Box>

						<Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

						<Box
							sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
						>
							<Typography variant="h6">Total Amount</Typography>
							<Typography variant="h6" color="primary">
								$
								{typeof totalPrice === 'number'
									? totalPrice.toFixed(2)
									: '0.00'}{' '}
								USD
							</Typography>
						</Box>

						<Box
							sx={{
								mt: 4,
								textAlign: 'center',
								display: 'flex',
								justifyContent: 'center',
								gap: 2,
							}}
						>
							{!isPaid && (
								<Button
									variant="contained"
									color="primary"
									onClick={handleProceedToPayment}
									disabled={processingPayment}
								>
									{processingPayment ? 'Processing...' : 'Proceed to Payment'}
								</Button>
							)}
							<Button
								variant={isPaid ? 'contained' : 'outlined'}
								color="primary"
								onClick={() => navigate('/')}
							>
								Return Home
							</Button>
						</Box>
					</CardContent>
				</Card>
			</Container>
		</Box>
	)
}
