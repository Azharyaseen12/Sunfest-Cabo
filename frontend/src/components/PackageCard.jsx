import {
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Chip,
    Typography,
    Box,
} from '@mui/material'
import { CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
  
export default function PackageCard({ pkg, eventId, event_date_id, onNext = false , setBookingData , bookingData}) {
const navigate = useNavigate()
const [showAll, setShowAll] = useState(false)


// Function to check if a package is sold out
const isPackageSoldOut = (pkg) => {
    return pkg.available_tickets === 0
}

const isSoldOut = isPackageSoldOut(pkg)

const handleButtonClick = () => {
    if (isSoldOut) return;
    
    if (typeof(onNext) === 'function') {
      console.log('PackageCard: Calling onNext prop function');
      setBookingData({
        ...bookingData,
        packageId: pkg.id,
        })
      onNext();
    } else {
      console.log('PackageCard: Falling back to navigation');
      navigate(`/events/${eventId}/packages/${event_date_id}/plane/${pkg.id}/booking/packages`);
    }
  };

return (
    <Tooltip
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
            onClick={handleButtonClick}
            disabled={isSoldOut}
            sx={{ mt: 'auto' }}
            >
            {isSoldOut ? 'Sold Out' : 'Select this Package'}
        </Button>

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
        </CardContent>
    </Card>
    </Tooltip>
)
}