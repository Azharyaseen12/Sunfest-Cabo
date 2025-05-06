import { useEffect, useState } from 'react'
import {
	Box,
	Container,
	Typography,
	Radio,
	RadioGroup,
	FormControlLabel,
	Button,
	Breadcrumbs,
	Stack,
	Tooltip,
} from '@mui/material'

export default function GroupSizeSelection({packageId, onNext, setBookingData, bookingData}) {
	const [selectedSize, setSelectedSize] = useState(bookingData?.groupSize || 1)
	const [groups, setGroups] = useState([])

	// Default group sizes from 1 to 8
	const defaultGroupSizes = Array.from({length: 8}, (_, i) => ({
		id: i+1,
		number_of_persons: i+1,
		base_price: bookingData?.pricePerPerson || 0
	}))

	useEffect(() => {
		// Set default groups
		setGroups(defaultGroupSizes)
	}, [packageId, bookingData])

	const handleNext = () => {
		setBookingData({
			...bookingData, 
			groupSize: selectedSize,
		})
		onNext()
	}

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
				{/* Main Content */}
				<Box sx={{ maxWidth: 600, mx: 'auto' }}>
					<Typography variant="h3" component="h1" gutterBottom align="left">
						Select Your Group Size
					</Typography>
					<Typography
						variant="body1"
						sx={{ mb: 4, color: '#FFFFFFA8' }}
						align="left"
					>
						Please select the number of people in your group. Pricing may vary
						based on number of rooms, hotel fees, and other related per person
						expenses.
					</Typography>

					{/* Group Size Selection */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							transform: 'translateX(-20px)',
						}}
					>
						<RadioGroup
							value={selectedSize}
							onChange={(e) => setSelectedSize(parseInt(e.target.value))}
							sx={{
								width: '100%',
								maxWidth: 650, // Increased max width
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Stack spacing={2}>
								{groups?.map((group) => (
									<Tooltip
										key={group.id}
										title=""
										placement="right"
									>
										<span>
											<FormControlLabel
												value={group.id}
												control={
													<Radio
														sx={{
															'& .MuiSvgIcon-root': {
																backgroundColor: 'white',
																borderRadius: '50%',
																border: '2px solid #D2691E',
															},
															'&.Mui-checked .MuiSvgIcon-root': {
																borderColor: 'primary.main',
															},
														}}
													/>
												}
												label={
													<Box
														sx={{
															width: '100%',
															p: 3,
															border: '2px solid',
															borderColor:
																selectedSize === group.id
																	? 'primary.main'
																	: 'divider',
															borderRadius: 2,
															bgcolor: '#FFFFFF12',
															transition: 'all 0.3s',
															'&:hover': {
																borderColor: selectedSize === group.id ? 'primary.main' : '#FFFFFF80',
																transform: 'translateY(-2px)',
																boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
															},
															minWidth: '500px' // Increased card width
														}}
													>
														<Box
															sx={{
																display: 'flex',
																justifyContent: 'space-between',
																alignItems: 'center',
																width: '100%',
															}}
														>
															<Typography
																variant="h6"
																sx={{
																	mr: 2,
																	flex: '0 0 auto',
																	color:
																		selectedSize === group.id
																			? 'primary.main'
																			: 'white',
																}}
															>
																{group.number_of_persons}{' '}
																{group.number_of_persons === 1
																	? 'Person'
																	: 'People'}
															</Typography>
															<Box
																sx={{
																	textAlign: 'right',
																	flex: '0 0 auto',
																	color:
																		selectedSize === group.id
																			? 'primary.main'
																			: 'white',
																}}
															>
																<Typography variant="h6">
																	From $
																	{parseFloat(bookingData?.pricePerPerson || 0).toFixed(2)}{' '}
																	USD
																	<Typography
																		component="span"
																		variant="body2"
																		sx={{ ml: 1 }}
																	>
																		/ Person
																	</Typography>
																</Typography>
																<Typography variant="body2">
																	$
																	{(
																		group.number_of_persons *
																		parseFloat(bookingData?.pricePerPerson || 0)
																	).toFixed(2)}{' '}
																	USD Total
																</Typography>
																<Typography
																	variant="caption"
																	color="#FFFFFF80"
																>
																	(Taxes and Fees Included)
																</Typography>
															</Box>
														</Box>
													</Box>
												}
												sx={{
													alignItems: 'center',
													margin: 0,
													'& .MuiRadio-root': {
														left: 20,
														top: '50%',
														zIndex: 1,
														color: 'white',
														'&.Mui-checked': {
															color: '#F821DB',
														},
													},
												}}
											/>
										</span>
									</Tooltip>
								))}
							</Stack>
						</RadioGroup>
					</Box>

					{/* Next Button */}
					<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
						<Button
							variant="contained"
							color="primary"
							size="large"
							onClick={handleNext}
							sx={{ minWidth: 200 }}
							disabled={!selectedSize}
						>
							Next
						</Button>
					</Box>
				</Box>
			</Container>
		</Box>
	)
}