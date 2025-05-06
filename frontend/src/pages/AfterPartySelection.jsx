import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Checkbox,
  Chip,
  Stack,
} from '@mui/material'
import api from '../utils/api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function AfterPartySelection({ packageId, onNext, setBookingData, bookingData }) {
  const [selectedParties, setSelectedParties] = useState(bookingData?.afterParties || [])
  const [afterParties, setAfterParties] = useState([])

  const handleSelect = (party) => {
    setSelectedParties(prev => {
      const isSelected = prev.some(p => p.id === party.id)
      return isSelected
        ? prev.filter(p => p.id !== party.id)
        : [...prev, party]
    })
  }

  const handleNext = () => {
    setBookingData(prev => ({
      ...prev,
      afterParties: selectedParties,
    }))
    onNext()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`event/after-parties/?after_party_type=${bookingData.after_party_type}`)
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
            After Party Experiences
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#FFFFFFA8' }} align="left">
            Select one or more after party options to enhance your experience
          </Typography>

          {/* Selected parties chip display */}
          {selectedParties.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Your Selections:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {selectedParties.map(party => (
                  <Chip
                    key={party.id}
                    label={`${party.location} ($${party.price_per_person})`}
                    onDelete={() => handleSelect(party)}
                    sx={{
                      backgroundColor: 'rgba(248, 33, 219, 0.2)',
                      color: 'white',
                      '& .MuiChip-deleteIcon': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          color: 'white'
                        }
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            mt: 2
          }}>
            {afterParties.map((party) => {
              const isSelected = selectedParties.some(p => p.id === party.id)
              const isSoldOut = party.remaining_capacity <= 0

              return (
                <Box 
                  key={party.id}
                  onClick={() => !isSoldOut && handleSelect(party)}
                  sx={{
                    bgcolor: isSelected ? 'rgba(248, 33, 219, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    p: 3,
                    borderRadius: 2,
                    border: isSelected ? '1px solid #F821DB' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': !isSoldOut && {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                      borderColor: isSelected ? '#F821DB' : 'rgba(255, 255, 255, 0.3)'
                    },
                    opacity: isSoldOut ? 0.6 : 1
                  }}
                >
                  {/* Selection indicator */}
                  <Checkbox
                    icon={<RadioButtonUncheckedIcon />}
                    checkedIcon={<CheckCircleIcon sx={{ color: '#F821DB' }} />}
                    checked={isSelected}
                    onChange={() => handleSelect(party)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isSoldOut}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&.Mui-checked': {
                        color: '#F821DB'
                      }
                    }}
                  />

                  {/* Sold out badge */}
                  {isSoldOut && (
                    <Chip
                      label="Sold Out"
                      size="small"
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: 8,
                        backgroundColor: '#F44336',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, pr: 4 }}>
                      {party.location}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="#F821DB" sx={{ fontWeight: 500 }}>
                        ${party.price_per_person} USD
                      </Typography>
                      <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                        per person
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                      {new Date(party.event_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Typography>

                    {!isSoldOut && (
                      <Typography variant="caption" color="#4CAF50" sx={{ fontWeight: 500 }}>
                        {party.remaining_capacity} spots available
                      </Typography>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 6,
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Button
              variant="outlined"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)'
                }
              }}
              onClick={handleNext}
            >
              Skip
            </Button>

            <Button
              variant="contained"
              sx={{ 
                backgroundColor: '#F821DB',
                minWidth: 200,
                '&:hover': {
                  backgroundColor: '#e01dc7'
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={handleNext}
              disabled={selectedParties.length === 0}
              endIcon={
                selectedParties.length > 0 && (
                  <Chip 
                    label={selectedParties.length} 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'white', 
                      color: '#F821DB',
                      fontWeight: 'bold'
                    }} 
                  />
                )
              }
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}