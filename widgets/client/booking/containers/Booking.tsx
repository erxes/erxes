import * as React from 'react';
import { Booking } from '../components';
import { AppConsumer } from './AppContext';
import { IBooking } from '../types';

type Props = {
  goToIntro: () => void;
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
      {({ goToIntro, activeBooking }) => {
        return (
          <BookingContainer goToIntro={goToIntro} booking={activeBooking} />
        );
      }}
    </AppConsumer>
  );
};

export default WithContext;
