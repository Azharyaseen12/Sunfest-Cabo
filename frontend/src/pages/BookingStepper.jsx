import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import { Button, Box, Breadcrumbs, Typography } from '@mui/material';
import ChevronRight from '@mui/icons-material/ChevronRight';

import PackageSelection from './PackageSelection';
import SelectYourTicketType from './SelectYourTicketType';
import GroupSizeSelection from './GroupSizeSelection';
import AccommodationSelection from './AccommodationSelection';
import RoomSelection from './RoomSelection';
import AddOnSelection from './AddOnSelection';
import ReviewPackage from './ReviewPackage';
import Header from '../components/Header';

const BookingStepper = () => {
  const navigate = useNavigate();
  const [direction, setDirection] = useState('right');
  const { eventId, event_date_id, packageId, step: currentStepPath } = useParams();
  const [bookingData, setBookingData] = useState({});
  const [initialLoad, setInitialLoad] = useState(true);

  const steps = [
    { 
      path: 'packages', 
      component: <PackageSelection 
        packageId={packageId} 
        eventId={eventId} 
        event_date_id={event_date_id} 
        onNext={() => navigateToStep(1)}
        setBookingData={setBookingData} 
        bookingData={bookingData}
      />, 
      title: 'Packages',
      skipIfPackageId: true
    },
    { 
      path: 'ticket-type', 
      component: <SelectYourTicketType 
        packageId={packageId} 
        eventId={eventId} 
        event_date_id={event_date_id}
        onNext={() => navigateToStep(2)}
        onBack={() => navigateToStep(0)}
        setBookingData={setBookingData}
        bookingData={bookingData}
      />, 
      title: 'Ticket Type' 
    },
    { 
      path: 'group-size', 
      component: <GroupSizeSelection 
        packageId={packageId} 
        eventId={eventId} 
        event_date_id={event_date_id}
        onNext={() => navigateToStep(3)}
        onBack={() => navigateToStep(1)}
        setBookingData={setBookingData}
        bookingData={bookingData}
      />, 
      title: 'Group Size' 
    },
    { 
      path: 'accommodation', 
      component: <AccommodationSelection 
      packageId={packageId} 
        eventId={eventId} 
        event_date_id={event_date_id}
        onNext={() => navigateToStep(4)}
        onBack={() => navigateToStep(2)}
        setBookingData={setBookingData}
        bookingData={bookingData}
        
      />, 
      title: 'Accommodation' 
    },
    { 
      path: 'rooms', 
      component: <RoomSelection 
        packageId={packageId} 
        eventId={eventId} 
        event_date_id={event_date_id}
        onNext={() => navigateToStep(5)}
        onBack={() => navigateToStep(3)}
        setBookingData={setBookingData}
        bookingData={bookingData}
      />, 
      title: 'Rooms' 
    },
    { 
      path: 'add-ons', 
      component: <AddOnSelection 
        packageId={packageId} 
        eventId={eventId} 
        event_date_id={event_date_id}
        onNext={() => navigateToStep(6)}
        onBack={() => navigateToStep(4)}
        bookingData={bookingData}
        setBookingData={setBookingData}
      />, 
      title: 'Add-ons' 
    },
    { 
      path: 'review', 
      component: <ReviewPackage 
        packageId={packageId} 
        eventId={eventId} 
        event_date_id={event_date_id}
        onBack={() => navigateToStep(5)}
        bookingData={bookingData}
        setBookingData={setBookingData}
      />, 
      title: 'Review' 
    },
  ];

  //============================================================================= Get current step index
  const currentStepIndex = steps.findIndex(step => step.path === currentStepPath);
  
  //============================================================================= Define current step
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : steps[0];

  useEffect(() => {
    if (initialLoad && packageId && currentStepPath === 'packages' && steps[0].skipIfPackageId) {
      //============================================================================= Skip the packages step if packageId is present on initial load
      navigateToStep(1);
    }
    setInitialLoad(false);
  }, [packageId, currentStepPath, initialLoad]);

  //============================================================================= Redirect to first step if invalid path
  if (currentStepIndex === -1) {
    const targetStep = packageId ? steps[1] : steps[0]; // Skip packages if packageId exists
    return <Navigate to={`/events/${eventId}/packages/${event_date_id}/plane/${packageId}/booking/${targetStep.path}`} replace />;
  }

  //============================================================================= Navigate to step
  const navigateToStep = (newIndex) => {
    if (newIndex >= 0 && newIndex < steps.length) {
      //============================================================================= Skip the packages step if packageId exists and we're trying to go to packages
      if (newIndex === 0 && packageId && steps[0].skipIfPackageId) {
        return;
      }
      
      const newDirection = newIndex > currentStepIndex ? 'right' : 'left';
      setDirection(newDirection);
      navigate(
        `/events/${eventId}/packages/${event_date_id}/plane/${packageId}/booking/${steps[newIndex].path}`
      );
    }
  };

  //============================================================================= Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction === 'right' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === 'right' ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <>
    <Header/>
    <Box sx={{ 
      width: '100%', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100%',
      mt: 16,
    }}>
      {/* Breadcrumbs - centered with max-width */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '90%',
      }}>
        <Breadcrumbs
          separator={<ChevronRight fontSize="small" sx={{ color: '#F821DB' }} />}
        >
          {steps.map((step, index) => {
            //============================================================================= Skip showing packages in breadcrumbs if packageId exists and it's the packages step
            if (packageId && step.skipIfPackageId && index > currentStepIndex) {
              return null;
            }
            
            if (index < currentStepIndex) {
              return (
                <Link
                  key={step.path}
                  to={`/events/${eventId}/packages/${event_date_id}/plane/${packageId}/booking/${step.path}`}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  {step.title}
                </Link>
              );
            } else if (index === currentStepIndex) {
              return (
                <Typography key={step.path} color="primary">
                  {step.title}
                </Typography>
              );
            } else {
              return (
                <Typography key={step.path} color="white">
                  {step.title}
                </Typography>
              );
            }
          })}
        </Breadcrumbs>
      </Box>

      {/* Current Step Content - takes full height and 90% width */}
      <Box sx={{ 
        width: '90%',
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentStep.path}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ flex: 1 }}>
              {currentStep.component}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
    </>
  );
};

export default BookingStepper;