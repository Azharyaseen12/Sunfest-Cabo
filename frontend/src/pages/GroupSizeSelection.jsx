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
import { useSelector, useDispatch } from 'react-redux'
import { setGroupSize, setStep } from '../store/slices/bookingSlice'

export default function GroupSizeSelection() {
  const dispatch = useDispatch()
  const { packageId, groupSize, pricePerPerson } = useSelector((state) => state.booking)
  const [selectedSize, setSelectedSize] = useState(groupSize || 1)
  const [groups, setGroups] = useState([])

  // Default group sizes from 1 to 8
  const defaultGroupSizes = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    number_of_persons: i + 1,
    base_price: pricePerPerson || 0,
  }))

  useEffect(() => {
    setGroups(defaultGroupSizes)
  }, [packageId, groupSize, defaultGroupSizes])

  const handleNext = () => {
    dispatch(setGroupSize(selectedSize))
    dispatch(setStep(3))
  }

  return (
    <Box className="min-h-screen bg-transparent text-white">
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 8 } }}>
        {/* Main Content */}
        <Box sx={{ maxWidth: { xs: '100%', md: 600 }, mx: 'auto' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            align="left"
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Select Your Group Size
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: '#FFFFFFA8', fontSize: { xs: '0.9rem', md: '1rem' } }}
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
              width: '100%',
            }}
          >
            <RadioGroup
              value={selectedSize}
              onChange={(e) => setSelectedSize(parseInt(e.target.value))}
              sx={{
                maxWidth: { xs: '100%', md: 650 }, // Responsive max width
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Stack spacing={2} sx={{ width: '100%' }}>
                {groups?.map((group) => (
                  <Tooltip
                    key={group.id}
                    title=""
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
                              p: { xs: 2, md: 3 }, // Responsive padding
                              border: '2px solid',
                              borderColor:
                                selectedSize === group.id
                                  ? 'primary.main'
                                  : 'divider',
                              borderRadius: 2,
                              bgcolor: '#FFFFFF12',
                              transition: 'all 0.3s',
                              '&:hover': {
                                borderColor: selectedSize === group.id ? 'primary.main' : '#FFFFFF80',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                              },
                              minWidth: { xs: 'auto', md: '500px' }, // Remove fixed minWidth on small screens
                              maxWidth: '100%', // Ensure it doesn't overflow
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                flexWrap: { xs: 'wrap', md: 'nowrap' }, // Wrap on small screens
                                gap: { xs: 1, md: 0 }, // Add gap on small screens
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  mr: { xs: 0, md: 2 },
                                  flex: '0 0 auto',
                                  color:
                                    selectedSize === group.id
                                      ? 'primary.main'
                                      : 'white',
                                  fontSize: { xs: '1rem', md: '1.25rem' }, // Responsive font size
                                  wordBreak: 'break-word', // Prevent overflow
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
                                  wordBreak: 'break-word', // Prevent overflow
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontSize: { xs: '0.9rem', md: '1.25rem' },
                                  }}
                                >
                                  From $
                                  {parseFloat(pricePerPerson || 0).toFixed(2)}{' '}
                                  USD
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      ml: 1,
                                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    }}
                                  >
                                    / Person
                                  </Typography>
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: { xs: '0.85rem', md: '1rem' },
                                  }}
                                >
                                  $
                                  {(
                                    group.number_of_persons *
                                    parseFloat(pricePerPerson || 0)
                                  ).toFixed(2)}{' '}
                                  USD Total
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="#FFFFFF80"
                                  sx={{
                                    fontSize: { xs: '0.65rem', md: '0.75rem' },
                                  }}
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
                            left: { xs: 10, md: 20 }, // Adjust radio button position
                            top: '50%',
                            zIndex: 1,
                            color: 'white',
                            '&.Mui-checked': {
                              color: '#F821DB',
                            },
                          },
                        }}
                      />
                    </span>
                  </Tooltip>
                ))}
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
              sx={{ minWidth: { xs: 150, md: 200 } }} // Responsive button width
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