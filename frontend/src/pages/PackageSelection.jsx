import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Container,
  Button,
} from '@mui/material'
import api from '../utils/api'
import PackageCard from '../components/PackageCard' 

export default function PackageSelection({onNext,setBookingData,bookingData,packageId}) {
  console.log(packageId);
  
  const [packages,setPackages] = useState([])
  const [selectedPackageId,setSelectedPackageId] =useState(null)
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState(null)  
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // setLoading(true);
        const response = await api.get(`event/packages/`);
        console.log(response.data)
        setPackages(response.data); 
        // setError(null);
      } catch (error) {
        console.error('Error fetching packages:', error);
        // setError('Failed to load packages. Please try again later.');
      } finally {
        // setLoading(false);
      }
    };

    fetchPackages();  
  }, []); 

  const handleNext = (packageId = selectedPackageId) => {
    console.log("Selected package ID:", packageId);
    
    setBookingData(prev => ({
      ...prev,
      packageId: packageId || selectedPackageId
    }));
  
    if (packageId || selectedPackageId) {
      onNext();
    }
  };

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
          {packages?.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              handleNext={() => handleNext(pkg.id)} // Pass ID directly
              isSelected={pkg.id === selectedPackageId}
              onSelect={(id) => setSelectedPackageId(id)}
            />
          ))}
          </Box>
        </Container>
      </Container>
    </Box>
  )
}