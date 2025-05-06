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
// import { useNavigate } from 'react-router'
import Logo from '../assets/images/SunsetFestLogo.svg'
import { useNavigate } from 'react-router'
  
export default function PackageCard({ pkg, handleNext = false ,onSelect}) {
// const navigate = useNavigate()
const [showAll, setShowAll] = useState(false)
const navigate = useNavigate();

// Function to check if a package is sold out
const isPackageSoldOut = (pkg) => {
    return pkg.available_tickets === 0
}

const isSoldOut = isPackageSoldOut(pkg)

const handleButtonClick = () => {    
    if (typeof handleNext === 'function') {
      console.log('Selecting package:', pkg.id);
      onSelect(pkg.id);
      handleNext(); 
    } else {
      navigate('/events/booking/', { state: { packageId: pkg.id,pricePerPerson : pkg.starting_price } });
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
            background : "rgba(255,255,255,0.1)",
            borderRadius: 2,
            display : "flex",
            alignItems:"center",
            pt:1,
            px:1,
            gap:1,
            mb:2,
            height:190
        }}>
        <Box
            sx={{
            mb: 2,
            overflow: 'hidden',
            '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
            },
            width : "50%"
            }}
        >
            <img
            src={Logo}
            alt={pkg.title}
            />
        </Box>
        <Box sx={{
            display : "flex",
            flexDirection : "column",
            gap : 1
        }} >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                background:
                  'linear-gradient(to right,#F821DB,#B549D8,#8D7BB1, #5526FF)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SUNSET FEST CABO
            </Typography>
            <Typography variant='body2' fontSize="12px" sx={{
                color : "rgba(255,255,255,0.7)"
            }}> 
            OCTOBER 24th - 26th, 2025
            </Typography>
            <Typography variant='body1' fontSize="18px" fontWeight="bold">
                {pkg?.package_name}
            </Typography>
        </Box>
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
            {pkg.package_name}
        </Typography>

        <Typography
            variant="subtitle2"
            sx={{
            mb: 4,
            mt: 0,
            textAlign: 'center',
            color:"rgba(255,255,255,0.8)",
            }}
            fontWeight="10px"

        >
           Hotel only package, concert ticket not included
        </Typography>

        {/* Price Display */}
        <Typography
            variant="h6"
            color="white"
            sx={{ mb: 0, textAlign: 'center', fontWeight: 'bold' }}
        >
            From ${parseFloat(pkg.starting_price).toFixed(2)} USD
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
            ${parseFloat(pkg.starting_price).toFixed(2) * 2} USD Total.
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
        {/* features List */}
        <List sx={{ mb: 0, flexGrow: 1 }}>
        {pkg?.features
            ?.slice(0, showAll ? pkg.features.length : 4)
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
                    {feature?.feature_text}
                </Typography>
                </ListItemText>
            </ListItem>
            ))}
        
        {/* Show "View More" button if there are more than 4 features */}
        {pkg.features?.length > 4 && !showAll && (
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