import * as React from 'react';
import Booking from '../components/Booking';
import { useAppContext } from './AppContext';

const BookingContainer: React.FC = () => {
  const { goToIntro, getBooking, goToCategory, goToProduct } = useAppContext();

  const booking = getBooking();

  const extendedProps = {
    goToIntro,
    booking,
    goToCategory,
    goToProduct,
  };

  return <Booking {...extendedProps} />;
};

export default BookingContainer;
