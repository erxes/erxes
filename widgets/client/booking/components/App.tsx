import * as React from 'react';
import { Booking, Intro, BlockDetail } from '../containers';
import { IBooking } from '../types';

type Props = {
  activeRoute: string;
  booking: IBooking;
};

function App({ booking, activeRoute }: Props) {
  const renderContent = () => {
    if (activeRoute === 'INTRO') {
      return <Intro booking={booking} />;
    }

    if (activeRoute === 'BOOKING') {
      return <Booking />;
    }

    if (activeRoute === 'BLOCK_DETAIL') {
      return <BlockDetail />;
    }

    return null;
  };

  return (
    <div id="erxes-widget-container">
      <div className="erxes-booking">{renderContent()}</div>
    </div>
  );
}

export default App;
