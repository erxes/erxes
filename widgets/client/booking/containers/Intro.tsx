import * as React from 'react';
import Intro from '../components/Intro';
import { AppConsumer } from './AppContext';
import { IBooking } from '../types';

type Props = {
  booking: IBooking;
};

function IntroContainer({ booking }: Props) {
  return (
    <AppConsumer>
      {({ goToBooking }) => {
        return <Intro booking={booking} onClick={goToBooking} />;
      }}
    </AppConsumer>
  );
}

export default IntroContainer;
