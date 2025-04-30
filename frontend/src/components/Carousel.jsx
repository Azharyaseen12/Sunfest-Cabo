import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  Box,
  Container,
  Typography,
  Button,
  Breadcrumbs,
  Card,
  CardContent,
  IconButton,
} from '@mui/material'
import { ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import Header from '../components/Header'
import api from '../utils/api'

const Carousel = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const defaultImage = 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=1974&auto=format&fit=crop'
  const displayImages = images.length > 0 ? images : [{ image: defaultImage }]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: 240,
        overflow: 'hidden',
        borderRadius: '4px 4px 0 0',
      }}
    >
      <img
        src={displayImages[currentIndex].image}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      {displayImages.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <ChevronLeft size={24} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <ChevronRightIcon size={24} />
          </IconButton>
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
            }}
          >
            {displayImages.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}
export default Carousel