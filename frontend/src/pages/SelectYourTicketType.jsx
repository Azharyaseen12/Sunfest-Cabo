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

export default function SelectYourTicketType({ packageId, onNext, setBookingData, bookingData }) {
    const [selectedTicket, setSelectedTicket] = useState(bookingData?.selectedTicket || null)
    const [selectedDate, setSelectedDate] = useState(bookingData?.selectedDate || null)
    const [ticketTypes, setTicketTypes] = useState([])

    const handleNext = () => {
        onNext();
        setBookingData(prev => ({
            ...prev,
            selectedTicket: selectedTicket,
            selectedDate: selectedDate
        }))
    }

    const handleDateSelect = (date, ticketId) => {
        setSelectedDate(date)
        setSelectedTicket(ticketId)
    }

    //========================== Check if a ticket has any available inventory of type "ONE_DAY"
    const hasOneDayInventory = (ticket) => {
        return ticket.inventory?.some(item => item.ticket_type_day === 'ONE_DAY' && item.remaining_inventory > 0)
    }

    //============================ Check if current ticket is selected with proper date (if needed)
    const isTicketSelectable = (ticket) => {
        if (hasOneDayInventory(ticket)) {
            return selectedTicket === ticket.id && selectedDate?.id
        }
        return selectedTicket === ticket.id
    }

    useEffect(() => {
        const fetchInventories = async () => {
            try {
                const ticketTypesResponse = await api.get(`event/ticket-types/?package=${packageId}`)
                const ticketTypes = ticketTypesResponse.data

                const ticketTypesWithInventories = await Promise.all(
                    ticketTypes.map(async (ticket) => {
                        try {
                            const inventoryResponse = await api.get(`event/ticket-inventory/?ticket_type=${ticket.id}`)
                            return {
                                ...ticket,
                                inventory: inventoryResponse.data
                            }
                        } catch (err) {
                            console.error(`Error fetching inventory for ticket ${ticket.id}`, err)
                            return {
                                ...ticket,
                                inventory: []
                            }
                        }
                    })
                )

                setTicketTypes(ticketTypesWithInventories)
            } catch (error) {
                console.error('Error fetching ticket types:', error)
            }
        }

        fetchInventories()
    }, [packageId])

    
    return (
        <Box className="min-h-screen bg-transparent text-white">
            <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
                {/* Main Content */}
                <Box sx={{ mx: 'auto', maxWidth: "100%" }}>
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
                            gap: 4,
                            mt: 4,
                            justifyItems : "center",
                            justifyContent:"center"
                        }}
                    >
                        {ticketTypes.map((ticket) => (
                            <Box 
                                key={ticket.id} 
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    p: 4,
                                    borderRadius: 2,
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    width : "32%"
                                }}
                            >
                                <Typography variant="h4" component="h2" gutterBottom>
                                    {ticket.ticket_name} Admission
                                </Typography>
                                <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                                    {ticket.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: "center" }}>
                                    <Typography variant="h5" component="h2" gutterBottom>From ${ticket.price} USD</Typography>
                                    <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>/ person</Typography>
                                </Box>
                                
                                {/* Date Selector */}
                                {hasOneDayInventory(ticket) && (
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="body1" fontSize={18} sx={{ mb: 2 }}>Select Date</Typography>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            gap: 3,
                                            flexWrap: 'wrap'
                                        }}>
                                            {ticket.inventory
                                                .filter(item => item.ticket_type_day === 'ONE_DAY')
                                                .map((date) => {
                                                    const isDisabled = !(date?.remaining_inventory > 0)
                                                    const isSelected = selectedDate?.id === date?.id && selectedTicket === ticket.id
                                                    
                                                    return (
                                                        <Box 
                                                            key={date?.id}
                                                            onClick={() => !isDisabled && handleDateSelect(date, ticket.id)}
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '50%',
                                                                bgcolor: isDisabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                                border: isSelected ? '1px solid #F821DB' : 'none',
                                                                color: isDisabled 
                                                                    ? 'rgba(255, 255, 255, 0.5)' 
                                                                    : isSelected 
                                                                        ? '#F821DB' 
                                                                        : 'white',
                                                                '&:hover': {
                                                                    border: !isDisabled && '1px solid #F821DB'
                                                                },
                                                                opacity: isDisabled ? 0.6 : 1
                                                            }}
                                                        >
                                                            <Typography 
                                                                variant="body1" 
                                                                color={isDisabled 
                                                                    ? 'rgba(255, 255, 255, 0.5)' 
                                                                    : isSelected 
                                                                        ? '#F821DB' 
                                                                        : 'white'
                                                                } 
                                                                fontWeight="bold"
                                                            >
                                                                {date?.event_day?.event_date.split("-")[2]}
                                                            </Typography>
                                                        </Box>
                                                    )
                                                })}
                                        </Box>
                                    </Box>
                                )}

                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    fullWidth 
                                    sx={{ mt: 2 }}
                                    onClick={handleNext}
                                    disabled={!isTicketSelectable(ticket)}
                                >
                                    Select
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}