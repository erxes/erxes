import * as React from 'react';
import { Booking, Intro, BlockDetail, Floor } from '../containers';
import { IBooking } from '../types';
import Navigation from '../containers/common/Navigation';

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

    if (activeRoute === 'FLOOR_DETAIL') {
      return <Floor />;
    }

    return null;
  };

  return (
    <div id="erxes-widget-container">
      <Navigation
        items={booking.categoryTree}
        parentId={booking.productCategoryId}
      />
      <div>{renderContent()}</div>
    </div>
  );
}

export default App;
