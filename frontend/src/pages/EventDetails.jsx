import { Link, useNavigate, useParams } from 'react-router'
import { Calendar, MapPin, Music2 } from 'lucide-react'
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Container,
} from '@mui/material'
import Header from '../components/Header'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import PackageCard from '../components/PackageCard' // Import the PackageCard component

export default function EventDetails() {
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { eventId } = useParams()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const response = await api.get(`events/events/${eventId}`)
        setEvent(response.data)
        setError(null)
      } catch (error) {
        console.error('Error fetching event:', error)
        setError('Failed to load event details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  if (loading) {
    return (
      <Box className="min-h-screen bg-gray-50">
        <Header />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="min-h-screen bg-gray-50">
        <Header />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    )
  }

  if (!event) {
    return null
  }

  // Function to check if a package is sold out
  const isPackageSoldOut = (pkg) => {
    return pkg.available_tickets === 0
  }

  return (
    <Box className="min-h-screen max-w-[1440px] mx-auto bg-transparent">
      <Header />
      <Box sx={{ pt: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: '70vh',
            color: 'white',
            bgcolor: 'transparent',
          }}
        >
          {/* Left Image */}
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              padding: { xs: 3, md: 6 },
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              className="w-[500px] h-[500px]"
              src={'/hero.png'}
              alt={event.title}
            />
          </Box>

          {/* Right Content */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'right',
              alignItems: 'flex-end',
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              {event.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'white' }}>
              {event.description}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontWeight: 'bold',
                background:
                  'linear-gradient(to right,#F821DB,#B549D8,#8D7BB1, #5526FF)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              October 24th -26th, 2025
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: '200px', height: '50px' }}
              onClick={() => {
                navigate(`/events/${eventId}/packages/${event.dates[0].id}/booking/packages`)
              }}
            >
              View Packages
            </Button>
          </Box>
        </Box>

        {/* Packages Section */}
        <Container maxWidth="lg" sx={{ py: 8 }} id="packages-section">
          {/* Packages Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {event.dates?.flatMap((date) =>
              date.pricing_plans?.map((pkg) => (
                <PackageCard
                  key={`${date.id}-${pkg.id}`}
                  pkg={pkg}
                  eventId={eventId}
                  event_date_id={date.id}
                />
              ))
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}