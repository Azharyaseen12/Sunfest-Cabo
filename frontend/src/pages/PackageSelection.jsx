import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Container,
  Button,
} from '@mui/material'
import api from '../utils/api'
import PackageCard from '../components/PackageCard' 

export default function PackageSelection({eventId, event_date_id,onNext,setBookingData,bookingData}) {
  const [planes, setPlanes] = useState([])
  const [event, setEvent] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)

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

  return (
    <Box className="min-h-screen bg-transparent text-white">
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
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
          {planes.map((pkg) => (
            <PackageCard 
              key={pkg.id} 
              pkg={pkg} 
              eventId={eventId} 
              event_date_id={event_date_id} 
              onNext={onNext}
              setBookingData={setBookingData}
              bookingData={bookingData}
            />
          ))}
        </Box>
      </Container>
    </Box>
  )
}