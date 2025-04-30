import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Box, Button } from '@mui/material'

const VerifyEmail = () => {
	const [isVerifying, setIsVerifying] = useState(true)
	const [verificationStatus, setVerificationStatus] = useState(null)
	const origin = import.meta.env.VITE_API_URL
	const navigate = useNavigate()

	// Extract the verification token from the URL
	const { token } = useParams()

	useEffect(() => {
		// Create a flag to prevent multiple API calls
		let isMounted = true

		const verifyEmail = async () => {
			// Check if email is already verified in localStorage
			const isEmailVerified = localStorage.getItem(`email_verified_${token}`)

			if (isEmailVerified) {
				if (isMounted) {
					setVerificationStatus('Email already verified')
					setIsVerifying(false)
					toast.info('Email already verified')
				}
				return
			}

			try {
				// Construct the verification URL
				const verifyUrl = `${origin}api/accounts/verify-email/${token}/`

				// Make the GET request to verify the email
				const response = await axios.get(verifyUrl)

				console.log(response)

				// Only update state if component is still mounted
				if (isMounted) {
					// Store verification status in localStorage
					localStorage.setItem(`email_verified_${token}`, 'true')
					// Store that we should show login popup
					localStorage.setItem('show_login_popup', 'true')

					setVerificationStatus(response.message)

					// Show success toast
					toast.success(response.message)

					// Redirect to home page after a short delay
					setTimeout(() => {
						navigate('/')
					}, 3000)
				}
			} catch (error) {
				// Handle verification errors
				if (isMounted) {
					if (axios.isAxiosError(error)) {
						const errorMessage =
							error.response?.message ||
							'Email verification failed. Please try again.'

						// Set verification status to error
						setVerificationStatus(errorMessage)

						// Show error toast
						toast.error(errorMessage)
					}
				}
			} finally {
				// Only set isVerifying to false if component is still mounted
				if (isMounted) {
					setIsVerifying(false)
				}
			}
		}

		// Call verification function
		verifyEmail()

		// Cleanup function to set isMounted to false
		return () => {
			isMounted = false
		}
	}, [token])

	return (
		<Box
			className="flex min-h-screen items-center justify-center "
			component="header"
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				zIndex: 1000,
				backdropFilter: 'blur(8px)',
				transition: 'all 0.3s ease-in-out',
				boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
			}}
		>
			<div className="lg:w-[35%] md:w-[50%] w-full rounded-lg bg-white p-8 shadow-lg text-center">
				<div className="flex justify-center mb-6">
					<img src="/hero.png" alt="Logo" className="h-20" />
				</div>

				{isVerifying ? (
					<div>
						<p className="text-[24px] font-[500] mb-4 text-foreground dark:text-black">
							Verifying Email...
						</p>
						<div className="flex justify-center">
							<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#45AC34]"></div>
						</div>
					</div>
				) : (
					<div>
						<p className="text-[24px] font-[500] mb-4 text-foreground dark:text-black">
							{verificationStatus || 'Email Verified.'}
							<br />
							Redirecting you to Home Page.
						</p>
						{/* return to home button*/}
						<div className="flex justify-center">
							<Button
								variant="contained"
								color="primary"
								component={Link}
								to="/"
							>
								Go to Home
							</Button>
						</div>
					</div>
				)}
			</div>
		</Box>
	)
}

export default VerifyEmail
