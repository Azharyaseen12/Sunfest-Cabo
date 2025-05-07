import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  packageId: null,
  pricePerPerson: 0,
  selectedTicket: null,
  selectedDate: null,
  afterParties: [],
  groupSize: 1,
  hotel: null,
  checkInDate: null,
  checkOutDate: null,
  nights: 0,
  selectedRooms: [],
  roomQuantities: {},
  roomIdsWithQuantities: '',
  roomsPrice: 0,
  selectedAddOns: [],
  totalPrice: 0,
  userInfo: {
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    subscribe: false,
  },
  step: 0,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setPackage: (state, action) => {
		state.packageId = action.payload.packageId;
		state.pricePerPerson = action.payload.pricePerPerson;
	  },	  
    setTicket: (state, action) => {
      state.selectedTicket = action.payload.id;
      state.selectedDate = action.payload.date;
      state.after_party_type = action.payload.ticketName;
      state.ticketPrice = action.payload.price;
    },
    setAfterParties: (state, action) => {
      state.afterParties = action.payload.afterParties;
      state.partyPrice = action.payload.partyPrice;
    },
    setGroupSize: (state, action) => {
      state.groupSize = action.payload;
    },
    setHotel: (state, action) => {
      state.hotel = action.payload;
    },
    setDates: (state, action) => {
      state.checkInDate = action.payload.checkIn;
      state.checkOutDate = action.payload.checkOut;
      state.nights = action.payload.nights;
    },
    setSelectedRooms: (state, action) => {
      state.selectedRooms = action.payload.rooms;
      state.roomQuantities = action.payload.quantities;
      state.roomIdsWithQuantities = action.payload.idsWithQuantities;
      state.roomsPrice = action.payload.totalPrice;
    },
    setAddOns: (state, action) => {
      state.selectedAddOns = action.payload.addOns;
      state.totalPrice = (state.totalPrice || 0) + action.payload.totalPrice;
    },
    setUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    resetBooking: () => initialState,
  },
});

export const {
  setPackage,
  setTicket,
  setAfterParties,
  setGroupSize,
  setHotel,
  setDates,
  setSelectedRooms,
  setAddOns,
  setUserInfo,
  setStep,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;