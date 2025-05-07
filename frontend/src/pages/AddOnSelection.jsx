import { useEffect, useState } from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Alert,
    CircularProgress,
    Tooltip
} from '@mui/material'
import { ChevronRight, DeleteIcon } from 'lucide-react'
import api from '../utils/api'
import { useDispatch, useSelector } from 'react-redux';
import { setAddOns, setStep } from '../store/slices/bookingSlice';


export default function AddOnSelection() {
    const { selectedAddOns} = useSelector((state) => state.booking);
	const dispatch = useDispatch();
    const [allAddOns, setAllAddOns] = useState([])
    const [currentSelectedAddOns, setCurrentSelectedAddOns] = useState(selectedAddOns || [])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAddOns = async () => {
            try {
                setLoading(true)
                const eventDateResponse = await api.get(`/event/add-ons/`)
                setAllAddOns(eventDateResponse.data)
                setError(null)
            } catch (err) {
                setError('Failed to load add-ons. Please try again later.')
                console.error('Error fetching add-ons:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAddOns()
    }, [])

    const handleAddItem = (addon) => {
        const existingIndex = currentSelectedAddOns.findIndex(item => item.addOn.id === addon.id)
        
        if (existingIndex >= 0) {
            const updatedSelections = [...currentSelectedAddOns]
            updatedSelections[existingIndex] = {
                addOn: addon,
                quantity: 1,
                totalPrice: addon.price_per_person
            }
            setCurrentSelectedAddOns(updatedSelections)
        } else {
            const newSelection = {
                addOn: addon,
                quantity: 1,
                totalPrice: addon.price_per_person
            }
            setCurrentSelectedAddOns(prev => [...prev, newSelection])
        }
    }

    const handleRemoveSelection = (index) => {
        setCurrentSelectedAddOns((prev) => prev.filter((_, i) => i !== index))
    }

    const handleUpdateQuantity = (index, newQuantity) => {
        if (newQuantity < 1) return
        setCurrentSelectedAddOns(prev => {
            const updated = [...prev]
            const item = updated[index]
            updated[index] = {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.addOn.price_per_person
            }
            return updated
        })
    }

    const getTotalPrice = () => {
        return currentSelectedAddOns.reduce(
            (total, selection) => parseFloat(total) + parseFloat(selection.totalPrice),
            0
        )
    }

    const handleNext = () => {
        const updatedBookingData = {
            addOns : currentSelectedAddOns
            .map((item) => ({
                addOn: item.addOn,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
            })),
            totalPrice: getTotalPrice()
        }
        dispatch(setAddOns(updatedBookingData))
        dispatch(setStep(6))
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        )
    }

    return (
        <Box className="min-h-screen bg-transparent text-white">
            <Container maxWidth="xl" sx={{ pt: 6, pb: 8 }}>
                <Typography variant="h4" component="h3" gutterBottom>
                    Choose Your Add-ons
                </Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 3,
                        width: '100%',
                        maxWidth: '100%',
                        pb: 8,
                    }}
                >
                    {allAddOns.map((addon) => {
                        const selections = currentSelectedAddOns.filter(
                            (selected) => selected.addOn.id === addon.id
                        )
                        const isSelected = selections.length > 0
                        const isDisabled = addon.remaining_inventory !== null && addon.remaining_inventory <= 0

                        return (
                            <Card
                                key={addon.id}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    border: isSelected ? '2px solid' : 'none',
                                    borderColor: 'primary.main',
                                    '&:hover': { boxShadow: 6 },
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 2,
                                    opacity: isDisabled ? 0.6 : 1
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={addon.image}
                                    alt={addon.add_on_name}
                                    sx={{
                                        height: 240,
                                        objectFit: 'contain',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: 2,
                                    }}
                                />
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h5" component="h2" color="white" gutterBottom>
                                        {addon.add_on_name}
                                    </Typography>
                                    <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ mb: 'auto' }}>
                                        {addon.description}
                                    </Typography>
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="h6" color="primary.main" align="center" gutterBottom>
                                            From ${parseFloat(addon.price_per_person).toFixed(2)} USD
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                / Person
                                            </Typography>
                                        </Typography>

                                        <Typography variant='body2' color='rgba(255,255,255,0.5)' textAlign="center" mb={2}>
                                            ${(parseFloat(addon.price_per_person) * 2).toFixed(2)} USD Total (Taxes and fees included)
                                            *Price shown based on 2 people
                                        </Typography>

                                        {isSelected && (
                                            <Box>
                                                {selections.map((selection, index) => {
                                                    const globalIndex = currentSelectedAddOns.findIndex(
                                                        item => item.addOn.id === addon.id
                                                    )
                                                    
                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                <IconButton
                                                                    size="large"
                                                                    onClick={() => handleUpdateQuantity(globalIndex, selection.quantity - 1)}
                                                                    disabled={selection.quantity <= 1}
                                                                >
                                                                    -
                                                                </IconButton>
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{ minWidth: '2rem', textAlign: 'center' }}
                                                                >
                                                                    {selection.quantity}
                                                                </Typography>
                                                                <IconButton
                                                                    size="large"
                                                                    onClick={() => handleUpdateQuantity(globalIndex, selection.quantity + 1)}
                                                                    disabled={addon.remaining_inventory !== null && 
                                                                            (selection.quantity >= addon.remaining_inventory)}
                                                                >
                                                                    +
                                                                </IconButton>
                                                            </Box>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => handleRemoveSelection(globalIndex)}
                                                                sx={{ flex: 1 }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Box>
                                                    )
                                                })}
                                            </Box>
                                        )}

                                        {!isSelected && <Tooltip title={isDisabled ? 'This add-on is sold out' : ''}>
                                            <span>
                                                <Button
                                                    variant={isSelected ? "outlined" : "contained"}
                                                    color="primary"
                                                    fullWidth
                                                    onClick={() => handleAddItem(addon)}
                                                    disabled={isDisabled}
                                                >
                                                    Add Item
                                                    {isDisabled && ' (Sold Out)'}
                                                </Button>
                                            </span>
                                        </Tooltip>}
                                    </Box>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Box>

                {/* Sticky Footer */}
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor:"#17171799",
                        backdropFilter:"blur(10px)",
                        boxShadow: 3,
                        p: 2,
                        zIndex: 1000,
                    }}
                >
                    <Container maxWidth="xl">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {currentSelectedAddOns.length > 0 ? (
                                <>
                                    <Typography variant="h6">
                                        Total: ${getTotalPrice().toFixed(2)} USD
                                    </Typography>
                                    <Button variant="contained" color="primary" onClick={handleNext} size="large">
                                        Continue to Review
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="outlined" color="primary" onClick={handleNext} size="large">
                                        Skip Add-ons
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Container>
                </Box>
            </Container>
            <Typography 
                variant="body1" 
                fontSize={20} 
                color="rgba(255, 255, 255, 0.6)" 
                maxWidth={300} 
                ml="auto" 
                sx={{ fontStyle: "italic", cursor: "pointer" }}
                onClick={handleNext}
            >
                Skip
            </Typography>
        </Box>
    )
}