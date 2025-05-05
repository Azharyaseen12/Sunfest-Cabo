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
import api from '../utils/api'

export default function GroupSizeSelection({packageId, onNext, setBookingData, bookingData}) {
	const [selectedSize, setSelectedSize] = useState(null)
	const [groups, setGroups] = useState([])
	const [pricingPlan, setPricingPlan] = useState(null)

	console.log("bookingData in GroupSizeSelection", bookingData)

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch group sizes
				const groupsResponse = await api.get(
					`events/group-sizes?pricing_plan_id=${packageId}`
				)
				setGroups(groupsResponse.data)

				// Fetch pricing plan details to get available tickets
				const planResponse = await api.get(`events/pricing-plans/${packageId}`)
				setPricingPlan(planResponse.data)

				// Set default selected size to the first available group size
				if (groupsResponse.data.length > 0) {
					const firstAvailableGroup = groupsResponse.data.find(
						(group) =>
							group.number_of_persons <= planResponse.data.available_tickets
					)
					if (firstAvailableGroup) {
						setSelectedSize(firstAvailableGroup.id)
					}
				}
			} catch (error) {
				console.error('Error fetching data:', error)
			}
		}

		fetchData()
	}, [packageId])

	// Function to check if a group size is available
	const isGroupSizeAvailable = (group) => {
		if (!pricingPlan) return false
		return group.number_of_persons <= pricingPlan.available_tickets
	}
	const handleNext = () => {
		onNext()
		console.log("selectedSize", selectedSize)
		setBookingData({...bookingData, groupSize: selectedSize})
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
							onChange={(e) => setSelectedSize(e.target.value)}
							sx={{
								width: '100%',
								maxWidth: 600,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Stack spacing={2}>
								{groups?.map((group) => {
									const isAvailable = isGroupSizeAvailable(group)
									return (
										<Tooltip
											key={group.id}
											title={
												!isAvailable
													? `Only ${pricingPlan?.available_tickets} tickets available`
													: ''
											}
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
																transition: 'border-color 0.3s',
																opacity: isAvailable ? 1 : 0.5,
															}}
														>
															<Box
																sx={{
																	display: 'flex',
																	justifyContent: 'space-between',
																	alignItems: 'center',
																	width: '100%', // Ensure full width
																	minWidth: '400px', // Set minimum width
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
																		{parseFloat(group.base_price).toFixed(2)}{' '}
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
																			parseFloat(group.base_price)
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
													disabled={!isAvailable}
												/>
											</span>
										</Tooltip>
									)
								})}
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
