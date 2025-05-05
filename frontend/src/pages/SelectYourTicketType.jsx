import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
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
import { ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import api from '../utils/api'

export default function SelectYourTicketType({eventId, event_date_id, packageId, onNext}) {
	const navigate = useNavigate()
	const [selectedSize, setSelectedSize] = useState(null)
	const [groups, setGroups] = useState([])
	const [pricingPlan, setPricingPlan] = useState(null)
	const [selectedDate, setSelectedDate] = useState(null)
	const handleNext = () => {
		if (selectedSize) {
			navigate(
				`/events/${eventId}/packages/${event_date_id}/plane/${packageId}/group-size/`
			)
		}
	}

	const availableDates = [
		{ id: 1, date: '15'},
		{ id: 2, date: '22'},
		{ id: 3, date: '29'}
	]

	const handleDateSelect = (date) => {
		setSelectedDate(date)
	}

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



	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>

				{/* Main Content */}
				<Box sx={{ mx: 'auto' , maxWidth : "70%"}}>
					<Typography variant="h3" component="h1" gutterBottom align="left" fontWeight="bold">
                    Select Your Ticket Type
					</Typography>
					<Typography
						variant="body1"
						sx={{ mb: 2, color: '#FFFFFFA8' }}
						align="left"
					>
						Please select the number of people in your group. Pricing may vary based on number of rooms, hotel fees, and other related per person expenses.
					</Typography>

					{/* Group Size Selection */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							gap: 4,
                            mt: 4,
						}}
					>
                        <Box sx={{
                             maxWidth : "50%" , bgcolor : 'rgba(255, 255, 255, 0.1)' ,
                            p: 4 , borderRadius : 2 , textAlign : "center" , display : "flex" , flexDirection : "column" , justifyContent : "space-between" , gap : 2}}>
                            <Typography variant="h4" component="h2" gutterBottom>
                                General Admission
                            </Typography>
                            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                            Please select the number of people in your group. Pricing may vary based on number of rooms, hotel fees, and other related per person expenses.
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 , justifyContent : "center"}}>
                                <Typography variant="h5" component="h2" gutterBottom>From $762.50 USD</Typography>
                                <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>/ person</Typography>
                            </Box>
                            {/* <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                            $1,456 USD Total
                            </Typography>
                            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                            (Taxes and Fees Included)
                            </Typography>
							 */}
							{/* Date Selector */}
							<Box sx={{ mb: 4 }}>
								<Typography variant="body1" fontSize={18} sx={{ mb: 2 }}>Select Date</Typography>
								<Box sx={{ 
								display: 'flex', 
								justifyContent: 'center', 
								gap: 3,
								flexWrap: 'wrap'
								}}>
								{availableDates.map((date) => (
									<Box 
									key={date.id}
									onClick={() => handleDateSelect(date.id)}
									sx={{
										width: 40,
										height: 40,
										borderRadius: '50%',
										bgcolor: 'rgba(255, 255, 255, 0.1)',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										cursor: 'pointer',
										border: selectedDate === date.id ? '1px solid #F821DB' : 'none',
										color: selectedDate === date.id ? '#F821DB' : 'white',
										'&:hover': {
										border: '1px solid #F821DB'
										}
									}}
									>
									<Typography variant="body1" color={`${selectedDate === date.id ? '#F821DB' : 'white'}`} fontWeight="bold">{date.date}</Typography>
									</Box>
								))}
								</Box>
							</Box>
                            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2
                             }} onClick={() => onNext()}>
                                Select
                            </Button>
                        </Box>

                        <Box sx={{ maxWidth : "50%" , bgcolor : "rgba(255, 255, 255, 0.1)" , 
                            p: 4 , borderRadius : 2 , textAlign : "center" , display : "flex" , flexDirection : "column" , justifyContent : "space-between" , gap : 2}}>
                            <Typography variant="h4" component="h2" gutterBottom>
                            VIP Admission
                            </Typography>
                            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                            Please select the number of people in your group. Pricing may vary based on number of rooms, hotel fees, and other related per person expenses.
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 , justifyContent : "center"}}>
                                <Typography variant="h5" component="h2" gutterBottom>From $762.50 USD</Typography>
                                <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>/ person</Typography>
                            </Box>
                            {/* <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                            $1,456 USD Total
                            </Typography>
                            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                            (Taxes and Fees Included)
                            </Typography> */}
							
							{/* Date Selector */}
							<Box sx={{ mb: 4 }}>
								<Typography variant="body1" fontSize={18} sx={{ mb: 2 }}>Select Date</Typography>
								<Box sx={{ 
								display: 'flex', 
								justifyContent: 'center', 
								gap: 3,
								flexWrap: 'wrap'
								}}>
								{availableDates.map((date) => (
									<Box 
									key={date.id}
									onClick={() => handleDateSelect(date.id)}
									sx={{
										width: 40,
										height: 40,
										borderRadius: '50%',
										bgcolor: 'rgba(255, 255, 255, 0.1)',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										cursor: 'pointer',
										border: selectedDate === date.id ? '1px solid #F821DB' : 'none',
										color: selectedDate === date.id ? '#F821DB' : 'white',
										'&:hover': {
										border: '1px solid #F821DB'
										}
									}}
									>
									<Typography variant="body1" color={`${selectedDate === date.id ? '#F821DB' : 'white'}`} fontWeight="bold">{date.date}</Typography>
									</Box>
								))}
								</Box>
							</Box>
                            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2
                             }} onClick={() => onNext()}>
                                Select
                            </Button>
                        </Box>
					</Box>
				</Box>
			</Container>
		</Box>
	)
}
