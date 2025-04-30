import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
	Box,
	Container,
	Typography,
	Card,
	CardContent,
	CircularProgress,
} from '@mui/material'
import { XCircle } from 'lucide-react'
import Header from '../components/Header'

export default function PaymentCancel() {
	const navigate = useNavigate()
	const [countdown, setCountdown] = useState(3)

	useEffect(() => {
		const timer = setTimeout(() => {
			navigate('/')
		}, 3000)

		const countdownInterval = setInterval(() => {
			setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
		}, 1000)

		return () => {
			clearTimeout(timer)
			clearInterval(countdownInterval)
		}
	}, [navigate])

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Header />
			<Container maxWidth="sm" sx={{ pt: 12, pb: 8 }}>
				<Card
					sx={{
						bgcolor: 'rgba(255, 255, 255, 0.2)',
						borderRadius: 3,
						p: 3,
						mb: 4,
					}}
				>
					<CardContent sx={{ textAlign: 'center' }}>
						<XCircle size={80} color="#f44336" />
						<Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
							Payment Cancelled
						</Typography>
						<Typography variant="body1" sx={{ mb: 4 }}>
							Your payment process was cancelled. Your booking has not been
							confirmed.
						</Typography>
						<Box
							sx={{
								mt: 4,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Typography variant="body2" sx={{ mr: 2 }}>
								Redirecting to home page in {countdown} seconds...
							</Typography>
							<CircularProgress size={20} />
						</Box>
					</CardContent>
				</Card>
			</Container>
		</Box>
	)
}
