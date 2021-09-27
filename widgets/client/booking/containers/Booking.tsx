import * as React from 'react';
import { Booking } from '../components';
import { AppConsumer } from './AppContext';

function BookingContainer() {
  return (
    <AppConsumer>
      {({ goToIntro, activeBooking }) => {
        return <Booking goToIntro={goToIntro} booking={activeBooking} />;
      }}
    </AppConsumer>
  );
}

export default BookingContainer;
