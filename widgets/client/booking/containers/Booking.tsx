import * as React from 'react';
import { Booking } from '../components';
import { AppConsumer } from './AppContext';
import { IBooking } from '../types';

type Props = {
  goToIntro: () => void;
  goToFloor?: () => void;
  booking: IBooking | null;
};

function BookingContainer(props: Props) {
  const extendedProps = {
    ...props
  };

  return <Booking {...extendedProps} />;
}

const WithContext = () => {
  return (
    <AppConsumer>
      {({ goToIntro, getBooking }) => {
        const booking = getBooking();
        return <BookingContainer goToIntro={goToIntro} booking={booking} />;
      }}
    </AppConsumer>
  );
};

export default WithContext;
