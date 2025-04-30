import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
	Box,
	Typography,
	Container,
	Card,
	CardContent,
	Button,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Tooltip,
	Chip,
} from '@mui/material'
import { CircleCheck } from 'lucide-react'
import Header from '../components/Header'
import api from '../utils/api'

export default function PackageSelection() {
	const { event_date_id, eventId } = useParams()
	const navigate = useNavigate()
	const [planes, setPlanes] = useState([])
	const [event, setEvent] = useState({})
	const [selectedDate, setSelectedDate] = useState(null)
	const [showAll, setShowAll] = useState(false)

	useEffect(() => {
		const fetchPlanes = async () => {
			try {
				const response = await api.get(
					`events/pricing-plans?event_date_id=${event_date_id}`
				)
				setPlanes(response.data)
			} catch (error) {
				console.error('Error fetching events:', error)
			}
		}
		const fetchEvents = async () => {
			try {
				const eventresponse = await api.get(`events/events/${eventId}`)
				setEvent(eventresponse.data)
				// Find the selected date from the event dates array
				const selectedDateObj = eventresponse.data.dates?.find(
					(date) => date.id === event_date_id
				)
				setSelectedDate(selectedDateObj)
			} catch (error) {
				console.error('Error fetching events:', error)
			}
		}

		fetchPlanes()
		fetchEvents()
	}, [event_date_id, eventId])

	// Function to check if a package is sold out
	const isPackageSoldOut = (pkg) => {
		return pkg.available_tickets === 0
	}

	return (
		<Box className="min-h-screen bg-transparent text-white">
			<Header />
			<Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
				{/* Hero Image */}
				<Box
					sx={{
						width: '100%',
						height: '400px',
						borderRadius: 4,
						overflow: 'hidden',
						position: 'relative',
						mb: 6,
						'&::after': {
							content: '""',
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							height: '50%',
							background:
								'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
						},
					}}
				>
					<img
						src={
							// event.image ??
							'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'
						}
						alt="Event Hero"
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
					<Box
						sx={{
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							p: 4,
							color: 'white',
							zIndex: 1,
						}}
					>
						<Typography variant="overline" sx={{ opacity: 0.8 }}>
							{selectedDate
								? new Date(selectedDate.date).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
										year: 'numeric',
								  })
								: ''}
						</Typography>
					</Box>
				</Box>

				{/* Hero Section */}
				<Box sx={{ mb: 6 }}>
					<Typography variant="h3" component="h1" gutterBottom>
						{selectedDate?.title || event.title}
					</Typography>
					<Typography variant="subtitle1" color="#F821DB">
						{selectedDate?.city}
					</Typography>
				</Box>

				{/* Packages Grid */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
						gap: 4,
					}}
				>
					{planes.map((pkg) => {
						const isSoldOut = isPackageSoldOut(pkg)
						return (
							<Tooltip
								key={pkg.id}
								title={isSoldOut ? 'This package is sold out' : ''}
								placement="top"
							>
								<Card
									sx={{
										height: '100%',
										display: 'flex',
										backgroundColor: '#FFFFFF12',
										color: 'white',
										borderRadius: 3,
										flexDirection: 'column',
										'&:hover': {
											boxShadow: isSoldOut ? 0 : 6,
										},
										opacity: isSoldOut ? 0.7 : 1,
										position: 'relative',
									}}
								>
									{isSoldOut && (
										<Chip
											label="Sold Out"
											color="error"
											sx={{
												position: 'absolute',
												top: 16,
												right: 16,
												zIndex: 1,
											}}
										/>
									)}
									<CardContent
										sx={{
											flexGrow: 1,
											display: 'flex',
											flexDirection: 'column',
										}}
									>
										{/* Package Image */}
										<Box
											sx={{
												height: 190,
												mb: 2,
												borderRadius: 2,
												overflow: 'hidden',
												'& img': {
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												},
											}}
										>
											<img
												src={
													pkg.banner_image ??
													'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'
												}
												alt={pkg.title}
											/>
										</Box>

										{/* Package Details */}
										<Typography
											variant="h6"
											gutterBottom
											sx={{
												textAlign: 'center',
												mb: 0,
											}}
										>
											{pkg.title}
										</Typography>
										<Typography
											variant="subtitle2"
											sx={{
												mb: 4,
												mt: 0,
												fontWeight: 'light',
												textAlign: 'center',
												color: '#FFFFFFA8',
											}}
										>
											{pkg.description}
										</Typography>

										{/* Price Display */}
										<Typography
											variant="h6"
											color="white"
											sx={{ mb: 0, textAlign: 'center', fontWeight: 'bold' }}
										>
											From ${parseFloat(pkg.price).toFixed(2)} USD
											<Typography
												component="span"
												variant="body2"
												color="white"
												sx={{ ml: 1 }}
											>
												/ Person
											</Typography>
										</Typography>
										<Box
											sx={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												mb: 2,
											}}
										>
											<Typography
												variant="body2"
												color="#FFFFFFA8"
												sx={{ textAlign: 'center', fontWeight: 'light' }}
											>
												${parseFloat(pkg.price).toFixed(2) * 2} USD Total.
												(Taxes and fees included)
											</Typography>
											<Typography
												variant="body2"
												color="rgba(255, 255, 255, 0.8)"
												sx={{ mb: 2, textAlign: 'center' }}
											>
												*Price shown based on 2 people.
											</Typography>
										</Box>

										{/* Action Button */}
										<Button
											variant="contained"
											color="primary"
											fullWidth
											onClick={() =>
												!isSoldOut &&
												navigate(
													`/events/${eventId}/packages/${event_date_id}/plane/${pkg.id}/group-size`
												)
											}
											disabled={isSoldOut}
											sx={{ mt: 'auto' }}
										>
											{isSoldOut ? 'Sold Out' : 'Select this Package'}
										</Button>

										{/* Available Tickets Info */}
										{/* <Typography variant="body2" color="white" sx={{ mb: 2 }}>
											Available Tickets: {pkg.available_tickets}
										</Typography> */}

										{/* Features */}
										<List sx={{ mb: 0, flexGrow: 1 }}>
											{pkg.feature
												?.slice(0, showAll ? pkg.feature.length : 4)
												.map((feature, index) => (
													<ListItem key={index} sx={{ py: 0.5 }}>
														<ListItemIcon sx={{ minWidth: 32 }}>
															<CircleCheck size={16} color="#F821DB" />
														</ListItemIcon>
														<ListItemText>
															<Typography
																sx={{
																	color: '#FFFFFFA8',
																	fontWeight: 'light',
																	fontSize: '14px',
																}}
															>
																{feature.name}
															</Typography>
														</ListItemText>
													</ListItem>
												))}
											{pkg.feature?.length > 4 && !showAll && (
												<Button
													onClick={() => setShowAll(true)}
													sx={{
														color: '#F821DB',
														textTransform: 'none',
														fontSize: '16px',
														mt: 1,
														textAlign: 'center',
														width: '100%',
													}}
												>
													View More
												</Button>
											)}
										</List>

										{/* Optional Add-ons Note
										<Typography
											variant="body2"
											color="white"
											sx={{ mb: 2, fontStyle: 'italic' }}
										>
											*Add-ons are optional and can be selected later in the
											booking process
										</Typography> */}
									</CardContent>
								</Card>
							</Tooltip>
						)
					})}
				</Box>

				{/* FAQs Section */}
				{/* <Box
					sx={{
						mt: 8,
						bgcolor: 'rgba(255, 255, 255, 0.2)',
						p: 4,
						borderRadius: 2,
					}}
				>
					<Typography
						variant="h4"
						component="h2"
						gutterBottom
						align="center"
						sx={{ mb: 4 }}
					>
						FAQs
					</Typography>

					{FAQS.map((category) => (
						<Box key={category.category} sx={{ mb: 4 }}>
							<Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
								{category.category}
							</Typography>

							{category.questions.map((faq, index) => (
								<Accordion
									key={index}
									expanded={expandedFaq === `${category.category}-${index}`}
									onChange={handleFaqChange(`${category.category}-${index}`)}
									sx={{
										mb: 1,
										boxShadow: 'none',
										'&:before': { display: 'none' },
										bgcolor: 'transparent',
									}}
								>
									<AccordionSummary
										expandIcon={<ChevronDown />}
										sx={{
											borderBottom: '1px solid',
											borderColor: 'divider',
											'&:hover': {
												bgcolor: 'rgba(0, 0, 0, 0.04)',
											},
										}}
									>
										<Typography variant="subtitle1" color="primary">
											{faq.question}
										</Typography>
									</AccordionSummary>
									<AccordionDetails sx={{ pt: 2, pb: 3 }}>
										<Typography variant="body1" color="white">
											{faq.answer}
										</Typography>
									</AccordionDetails>
								</Accordion>
							))}
						</Box>
					))}
				</Box> */}
			</Container>
		</Box>
	)
}
