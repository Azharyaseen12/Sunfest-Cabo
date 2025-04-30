import { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Clock } from 'lucide-react'
import api from '../utils/api'

export default function BookingTimer({ holdId, onExpire }) {
	const [timeLeft, setTimeLeft] = useState(null)
	const [isExtending, setIsExtending] = useState(false)

	useEffect(() => {
		const fetchHoldExpiration = async () => {
			try {
				const response = await api.get(`/events/ticket-holds/${holdId}/`)
				const expiresAt = new Date(response.data.expires_at)
				const now = new Date()
				const remainingSeconds = Math.max(
					0,
					Math.floor((expiresAt - now) / 1000)
				)
				setTimeLeft(remainingSeconds)
			} catch (error) {
				console.error('Error fetching hold expiration:', error)
				if (error.response?.status !== 404) {
					onExpire()
				}
			}
		}

		fetchHoldExpiration()
	}, [holdId, onExpire])

	useEffect(() => {
		if (timeLeft === null) return

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					onExpire()
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [timeLeft, onExpire])

	const formatTime = (seconds) => {
		if (seconds === null) return 'Loading...'
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	const handleExtend = async () => {
		try {
			setIsExtending(true)
			await api.post(`/events/ticket-holds/${holdId}/extend/`, {
				extra_minutes: 5,
			})
			// Fetch updated expiration time
			const response = await api.get(`/events/ticket-holds/${holdId}/`)
			const expiresAt = new Date(response.data.expires_at)
			const now = new Date()
			const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000))
			setTimeLeft(remainingSeconds)
		} catch (error) {
			console.error('Error extending hold:', error)
		} finally {
			setIsExtending(false)
		}
	}

	if (timeLeft === null) {
		return (
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 2,
					p: 2,
					bgcolor: 'warning.light',
					borderRadius: 1,
					mb: 2,
				}}
			>
				<Clock size={20} />
				<Typography variant="body1">Loading timer...</Typography>
			</Box>
		)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				p: 2,
				bgcolor: 'warning.light',
				borderRadius: 1,
				mb: 2,
			}}
		>
			<Clock size={20} />
			<Typography variant="body1">
				Time remaining: {formatTime(timeLeft)}
			</Typography>
			<Button
				variant="contained"
				color="warning"
				onClick={handleExtend}
				disabled={isExtending}
			>
				Extend Time
			</Button>
		</Box>
	)
}
