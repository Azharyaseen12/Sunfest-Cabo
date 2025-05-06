import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material'
import api from '../utils/api'

export default function AfterPartySelection({ packageId, onNext, setBookingData, bookingData }) {
  const [selectedParty, setSelectedParty] = useState(bookingData?.afterParty || {})
  const [afterParties, setAfterParties] = useState([])

  const handleSelect = (party) => {
    setSelectedParty(party)
    setBookingData(prev => ({
      ...prev,
      afterParty: party,
    }))
  }

  const handleCardClick = (party) => {
    handleSelect(party)
  }

  const handleSelectClick = (party, e) => {
    e.stopPropagation() // Prevent card click from triggering
    handleSelect(party)
    onNext()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`event/after-parties/?after_party_type=${bookingData.after_party_type}`)
        console.log(response.data);
        
        setAfterParties(response.data)
      } catch (error) {
        console.error('Error fetching after parties:', error)
      }
    }
    fetchData()
  }, [packageId, bookingData.after_party_type])

  return (
    <Box className="min-h-[85vh] bg-transparent text-white">
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Box sx={{ mx: 'auto', maxWidth: "100%" }}>
          <Typography variant="h3" component="h1" gutterBottom align="left" fontWeight="bold">
            Select After Party Option
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 2, color: '#FFFFFFA8' }}
            align="left"
          >
            Choose your preferred after party experience. Pricing is per person.
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 4, 
            mt: 4,
            justifyContent: "center",
            flexWrap: 'wrap'
          }}>
            {afterParties.map((party) => (
              <Box 
                key={party.id}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  p: 4,
                  borderRadius: 2,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  width: { xs: '100%', sm: '48%', md: '32%' },
                  border: selectedParty?.id === party.id ? '2px solid #F821DB' : 'none',
                }}
              >
                <Box onClick={() => handleCardClick(party)} sx={{ cursor: 'pointer' , display : "flex" , flexDirection : "column" , gap :1 }} >
                  <Typography variant="h5" component="h2" gutterBottom>
                    {party.location}
                  </Typography>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" gutterBottom>
                    {party.after_party_type} Access
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: "center" }}>
                    <Typography variant="h5" component="h2">${party.price_per_person} USD</Typography>
                    <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">/ person</Typography>
                  </Box>

                  <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                    {new Date(party.event_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>

                  <Typography variant="body2" color={party.remaining_capacity > 0 ? '#4CAF50' : '#F44336'}>
                    {party.remaining_capacity > 0 
                      ? `${party.remaining_capacity} spots remaining` 
                      : 'Sold out'}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 2,
                    backgroundColor: '#F821DB',
                    '&:hover': {
                      backgroundColor: '#e01dc7'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                  onClick={(e) => handleSelectClick(party, e)}
                  disabled={party.remaining_capacity <= 0}
                >
                  {selectedParty?.id === party.id ? 'Selected' : 'Select'}
                </Button>
              </Box>
            ))}
          </Box>

          <Typography 
            variant="body1" 
            fontSize={20} 
            color="rgba(255, 255, 255, 0.6)" 
            sx={{
              fontStyle: "italic",
              cursor: "pointer",
              m: 4,
              position : "absolute",
              right : 0,
              bottom : 0
            }}
            onClick={onNext}
          >
            Skip
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}