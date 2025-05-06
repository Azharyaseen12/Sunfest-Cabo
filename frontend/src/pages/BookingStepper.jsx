import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Box, Breadcrumbs, Typography } from '@mui/material'
import ChevronRight from '@mui/icons-material/ChevronRight'

import PackageSelection from './PackageSelection'
import SelectYourTicketType from './SelectYourTicketType'
import GroupSizeSelection from './GroupSizeSelection'
import AccommodationSelection from './AccommodationSelection'
import RoomSelection from './RoomSelection'
import AddOnSelection from './AddOnSelection'
import ReviewPackage from './ReviewPackage'
import Header from '../components/Header'
import AfterPartySelection from './AfterPartySelection'

const BookingStepper = () => {
	const [direction, setDirection] = useState('right')
	const [bookingData, setBookingData] = useState({})
	const [currentStepIndex, setCurrentStepIndex] = useState(0)
	const location = useLocation()
	const packageId = location?.state?.packageId
	const pricePerPerson = location?.state?.pricePerPerson

	console.log('packageId', packageId)

	useEffect(() => {
		setBookingData((prev) => ({
			...prev,
			packageId: packageId,
			pricePerPerson: pricePerPerson,
		}))
	}, [pricePerPerson, packageId])

	console.log('Booking Data', bookingData)

	const steps = [
		{
			path: 'ticket-type',
			component: (
				<SelectYourTicketType
					packageId={packageId}
					onNext={() => moveToStep(1)}
					onBack={() => moveToStep(0)}
					setBookingData={setBookingData}
					bookingData={bookingData}
				/>
			),
			title: 'Ticket Type',
		},
		{
			path: 'after-party',
			component: (
				<AfterPartySelection
					packageId={packageId}
					onNext={() => moveToStep(2)}
					onBack={() => moveToStep(1)}
					bookingData={bookingData}
					setBookingData={setBookingData}
				/>
			),
			title: 'After Party',
		},
		{
			path: 'group-size',
			component: (
				<GroupSizeSelection
					packageId={packageId}
					onNext={() => moveToStep(3)}
					onBack={() => moveToStep(2)}
					setBookingData={setBookingData}
					bookingData={bookingData}
				/>
			),
			title: 'Group Size',
		},
		{
			path: 'accommodation',
			component: (
				<AccommodationSelection
					packageId={packageId}
					onNext={() => moveToStep(4)}
					onBack={() => moveToStep(2)}
					onSkip={() => moveToStep(5)}
					setBookingData={setBookingData}
					bookingData={bookingData}
				/>
			),
			title: 'Accommodation',
		},
		{
			path: 'rooms',
			component: (
				<RoomSelection
					packageId={packageId}
					onNext={() => moveToStep(5)}
					onBack={() => moveToStep(3)}
					setBookingData={setBookingData}
					bookingData={bookingData}
				/>
			),
			title: 'Rooms',
		},
		{
			path: 'add-ons',
			component: (
				<AddOnSelection
					packageId={packageId}
					onNext={() => moveToStep(6)}
					onBack={() => moveToStep(5)}
					bookingData={bookingData}
					setBookingData={setBookingData}
				/>
			),
			title: 'Add-ons',
		},
		{
			path: 'review',
			component: (
				<ReviewPackage
					packageId={packageId}
					onBack={() => moveToStep(5)}
					bookingData={bookingData}
					setBookingData={setBookingData}
				/>
			),
			title: 'Review',
		},
	]

	// Define current step
	const currentStep = steps[currentStepIndex]

	useEffect(() => {
		// If packageId exists on mount, skip to step 1
		if (packageId && currentStepIndex === 0 && steps[0].skipIfPackageId) {
			moveToStep(1)
		}
	}, [packageId])

	// Move between steps
	const moveToStep = (newIndex) => {
		if (newIndex >= 0 && newIndex < steps.length) {
			// Skip the packages step if packageId exists and we're trying to go to packages
			if (newIndex === 0 && packageId && steps[0].skipIfPackageId) {
				return
			}

			const newDirection = newIndex > currentStepIndex ? 'right' : 'left'
			setDirection(newDirection)
			setCurrentStepIndex(newIndex)
		}
	}

	// Animation variants
	const variants = {
		enter: (direction) => ({
			x: direction === 'right' ? 300 : -300,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction) => ({
			x: direction === 'right' ? -300 : 300,
			opacity: 0,
		}),
	}

	return (
		<>
			<Header />
			<Box
				sx={{
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					minHeight: '80vh',
					mt: 16,
				}}
			>
				{/* Breadcrumbs - centered with max-width */}
				<Box
					sx={{
						width: '100%',
						maxWidth: '90%',
					}}
				>
					<Breadcrumbs
						separator={
							<ChevronRight fontSize="small" sx={{ color: '#F821DB' }} />
						}
					>
						{steps.map((step, index) => {
							// Skip showing packages in breadcrumbs if packageId exists and it's the packages step
							if (
								packageId &&
								step.skipIfPackageId &&
								index > currentStepIndex
							) {
								return null
							}

							if (index < currentStepIndex) {
								return (
									<Typography
										key={step.path}
										onClick={() => moveToStep(index)}
										style={{
											color: 'white',
											textDecoration: 'none',
											cursor: 'pointer',
										}}
									>
										{step.title}
									</Typography>
								)
							} else if (index === currentStepIndex) {
								return (
									<Typography key={step.path} color="primary">
										{step.title}
									</Typography>
								)
							} else {
								return (
									<Typography key={step.path} color="white">
										{step.title}
									</Typography>
								)
							}
						})}
					</Breadcrumbs>
				</Box>

				{/* Current Step Content - takes full height and 90% width */}
				<Box
					sx={{
						width: '90%',
						flex: 1,
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<AnimatePresence custom={direction} initial={false}>
						<motion.div
							key={currentStep.path}
							custom={direction}
							variants={variants}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
							style={{
								width: '100%',
								height: '100%',
								position: 'relative',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Box sx={{ flex: 1 }}>{currentStep.component}</Box>
						</motion.div>
					</AnimatePresence>
				</Box>
			</Box>
		</>
	)
}

export default BookingStepper
