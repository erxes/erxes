import * as React from 'react';
import Intro from '../components/Intro';
import { useAppContext } from './AppContext';

function IntroContainer() {
  const { goToBooking, getBooking, goToCategory } = useAppContext();

  const booking = getBooking();

  return (
    <Intro
      booking={booking}
      goToBooking={goToBooking}
      goToCategory={goToCategory}
    />
  );
}

export default IntroContainer;
