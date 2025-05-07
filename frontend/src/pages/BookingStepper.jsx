import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Box, Breadcrumbs, Typography } from '@mui/material';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useSelector, useDispatch } from 'react-redux';
import { setStep , setPackage } from '../store/slices/bookingSlice';

import SelectYourTicketType from './SelectYourTicketType';
import GroupSizeSelection from './GroupSizeSelection';
import AccommodationSelection from './AccommodationSelection';
import RoomSelection from './RoomSelection';
import AddOnSelection from './AddOnSelection';
import ReviewPackage from './ReviewPackage';
import Header from '../components/Header';
import AfterPartySelection from './AfterPartySelection';

const BookingStepper = () => {
  const dispatch = useDispatch();
  const { step, hotel } = useSelector((state) => state.booking);
  const location = useLocation();
  const packageId = location?.state?.packageId;
  const pricePerPerson = location?.state?.pricePerPerson;

  useEffect(() => {
    dispatch(setPackage({packageId:packageId,pricePerPerson:pricePerPerson}))
  },[packageId,pricePerPerson,dispatch])

  const steps = [
    { 
      path: 'ticket-type', 
      component: <SelectYourTicketType />, 
      title: 'Ticket Type' 
    },
    { 
      path: 'after-party', 
      component: <AfterPartySelection />,
      title: 'After Party'
    },
    { 
      path: 'group-size', 
      component: <GroupSizeSelection />, 
      title: 'Group Size' 
    },
    { 
      path: 'accommodation', 
      component: <AccommodationSelection />, 
      title: 'Accommodation' 
    },
    { 
      path: 'rooms', 
      component: <RoomSelection />, 
      title: 'Rooms',
      disabled: !hotel
    },
    { 
      path: 'add-ons', 
      component: <AddOnSelection />, 
      title: 'Add-ons' 
    },
    { 
      path: 'review', 
      component: <ReviewPackage />, 
      title: 'Review' 
    },
  ];

  const currentStep = steps[step];

  const moveToStep = (newStep) => {
    if (newStep >= 0 && newStep < steps.length) {
      // If trying to go to Rooms step without a hotel selected, redirect to Accommodation
      if (newStep === 4 && !hotel) {
        newStep = 3;
      }
      dispatch(setStep(newStep));
    }
  };

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
        minHeight: '80vh',
        mt: 16,
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '90%',
        }}>
          <Breadcrumbs
            separator={<ChevronRight fontSize="small" sx={{ color: '#F821DB' }} />}
          >
            {steps.map((stepItem, index) => {
              if (index < step) {
                return (
                  <Typography
                    key={stepItem.path}
                    onClick={() => moveToStep(index)}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {stepItem.title}
                  </Typography>
                );
              } else if (index === step) {
                return (
                  <Typography key={stepItem.path} color="primary">
                    {stepItem.title}
                  </Typography>
                );
              } else {
                return (
                  <Box 
                    key={stepItem.path}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: stepItem.disabled ? "not-allowed" : 'default',
                    }}
                    onClick={stepItem.disabled ? () => moveToStep(3) : undefined}
                  >
                    <Typography
                      color="white"
                      sx={{
                        mr: stepItem.disabled ? 1 : 0,
                      }}
                    >
                      {stepItem.title}
                    </Typography>
                  </Box>
                );
              }
            })}
          </Breadcrumbs>
        </Box>

        <Box sx={{ 
          width: '90%',
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={currentStep.path}
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