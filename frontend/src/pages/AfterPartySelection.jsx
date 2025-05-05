import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  styled
} from '@mui/material'
import api from '../utils/api'
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const StyledDateCircle = styled(Box)(({ selected, theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: selected ? '#F821DB' : 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: selected ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
  color: selected ? 'white' : 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: '#F821DB'
  }
}))

export default function AfterPartySelection({ eventId, event_date_id, packageId, onNext }) {
  const navigate = useNavigate()
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [groups, setGroups] = useState([])
  const [pricingPlan, setPricingPlan] = useState(null)
  const [quantity, setQuantity] = useState(3)
  
  const availableDates = [
    { id: 1, date: '15' },
    { id: 2, date: '22' },
    { id: 3, date: '29' }
  ]

  const handleDateSelect = (dateId) => {
    setSelectedDate(dateId)
  }

  const handleQuantityChange = (event) => {
    const value = Math.max(1, Math.min(10, event.target.value))
    setQuantity(value)
  }

  const calculateTotal = () => {
    const pricePerPerson = 1525 / 3
    return (pricePerPerson * quantity).toFixed(2)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsResponse = await api.get(
          `events/group-sizes?pricing_plan_id=${packageId}`
        )
        setGroups(groupsResponse.data)

        const planResponse = await api.get(`events/pricing-plans/${packageId}`)
        setPricingPlan(planResponse.data)

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
        <Box sx={{ mx: 'auto', maxWidth: '70%' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom align="center">
            After Party Options
          </Typography>

          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 4,
            alignItems: 'center'
          }}>
            {/* Improved Quantity Selector */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              width: '100%', 
              justifyContent: 'center',
			  maxWidth: 500,
			  backgroundColor: "rgba(255, 255, 255, 0.1)",
			  borderRadius: 2,
			  p: 1
            }}>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.6)">
                How many people for After Party?
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                p: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: '#F821DB'
                }
              }}>
                <IconButton 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(248, 33, 219, 0.2)'
                    }
                  }}
                  size="small"
				  fontWeight="bold"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                
                <TextField
                  value={quantity}
                  onChange={handleQuantityChange}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    inputProps: {
                      style: { 
                        textAlign: 'center',
                        color: 'white',
                        width: '40px',
                        padding: 0
                      },
                      min: 1,
                      max: 10
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '32px'
                    }
                  }}
                />
                
                <IconButton 
                  onClick={() => setQuantity(quantity + 1)}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(248, 33, 219, 0.2)'
                    }
                  }}
                  size="small"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{
              width: '100%',
              maxWidth: 500,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              p: 4,
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body1" fontSize={18} sx={{ mb: 2 }}>Select the date</Typography>
              
			  <Box sx={{ 
				display: 'flex', 
				justifyContent: 'center', 
				gap: 3,
				flexWrap: 'wrap',
				mb: 2,
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

              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1,
                mb: 3
              }}>
                <Typography variant="body1" fontWeight="semibold" fontSize={22} sx={{ mb: 1 }}>
                  From ${(1525/3).toFixed(2)} USD / Person
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" maxWidth={300} margin="auto">
				$1,525 USD Total (Taxes and fees included)
				*Price shown based on 2 people
                </Typography>
              </Box>

              <Button 
                variant="contained" 
                fullWidth 
                sx={{ 
                  backgroundColor: '#F821DB',
                  '&:hover': {
                    backgroundColor: '#e01dc7'
                  },
                  py: 1,
                  fontSize: '1rem',
                }}
                disabled={!selectedDate}
                onClick={onNext}
              >
                Add Item
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
	  <Typography variant="body1" fontSize={20} color="rgba(255, 255, 255, 0.6)" maxWidth={300} ml="auto" sx={{
			fontStyle : "italic",
			cursor : "pointer"
		}}
		onClick={onNext}
		>
		Skip
		</Typography>
    </Box>
  )
}