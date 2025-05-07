import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Checkbox,
  Alert,
  Stack,
  Chip 
} from '@mui/material'
import api from '../utils/api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useSelector, useDispatch } from 'react-redux';
import { setAfterParties, setStep } from '../store/slices/bookingSlice';


export default function AfterPartySelection() {
  const dispatch = useDispatch();
  const { packageId , afterParties} = useSelector((state) => state.booking);

  const [selectedParties, setSelectedParties] = useState(afterParties|| [])
  const [parties,setParties] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSelect = (party) => {
    // Check if this party is already selected
    const isSelected = selectedParties.some(p => p.id === party.id)
    
    if (isSelected) {
      // If already selected, remove it
      setSelectedParties(prev => prev.filter(p => p.id !== party.id))
      setErrorMessage(null)
      return
    }

    // Check if there's already a party with the same date
    const sameDateParty = selectedParties.find(p => 
      new Date(p.event_date).toDateString() === new Date(party.event_date).toDateString()
    )

    if (sameDateParty) {
      setErrorMessage(`You can only select one party per date. You've already selected a party for ${new Date(party.event_date).toLocaleDateString()}.`)
      return
    }

    // If no conflicts, add the new party to existing selections
    setSelectedParties(prev => [...prev, party])
    setErrorMessage(null)
  }

  const handleNext = () => {
    const totalAmount = selectedParties.reduce((sum, party) => sum + parseFloat(party.price_per_person), 0);
    
    dispatch(setAfterParties({
      afterParties: selectedParties,
      partyPrice: totalAmount,
    }));
    dispatch(setStep(2))
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`event/after-parties/`)
        setParties(response.data)
      } catch (error) {
        console.error('Error fetching after parties:', error)
      }
    }
    fetchData()
  }, [packageId])

  return (
    <Box className="min-h-[85vh] bg-transparent text-white">
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Box sx={{ mx: 'auto', maxWidth: "100%" }}>
          <Typography variant="h3" component="h1" gutterBottom align="left" fontWeight="bold">
            After Party Experiences
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#FFFFFFA8' }} align="left">
            Select one party per date (you can choose multiple parties for different dates)
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            mt: 2
          }}>
            {parties.map((party) => {
              const isSelected = selectedParties.some(p => p.id === party.id)
              const isSoldOut = party.remaining_capacity <= 0
              const sameDateSelected = selectedParties.some(p => 
                new Date(p.event_date).toDateString() === new Date(party.event_date).toDateString()
              )

              return (
                <Box 
                  key={party.id}
                  onClick={() => !isSoldOut && handleSelect(party)}
                  sx={{
                    bgcolor: isSelected ? 'rgba(248, 33, 219, 0.1)' : 
                             sameDateSelected ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    p: 3,
                    borderRadius: 2,
                    border: isSelected ? '1px solid #F821DB' : 
                           sameDateSelected ? '1px solid #FF5722' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': !isSoldOut && {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                      borderColor: isSelected ? '#F821DB' : 
                                   sameDateSelected ? '#FF5722' : 'rgba(255, 255, 255, 0.3)'
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

                  {/* Date conflict warning */}
                  {sameDateSelected && !isSelected && !isSoldOut && (
                    <Chip
                      label="Date conflict"
                      size="small"
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: 8,
                        backgroundColor: '#FF5722',
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
            >
              Continue ({selectedParties.length} selected)
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}