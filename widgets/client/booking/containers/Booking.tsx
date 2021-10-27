import * as React from 'react';
import { Booking } from '../components';
import { AppConsumer } from './AppContext';
import { IBookingData } from '../types';

type Props = {
  goToIntro: () => void;
  booking: IBookingData | null;
  goToCategory: (categoryId: string) => void;
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
      {({ goToIntro, getBooking, goToCategory }) => {
        const booking = getBooking();
        return (
          <BookingContainer
            goToIntro={goToIntro}
            booking={booking}
            goToCategory={goToCategory}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithContext;
