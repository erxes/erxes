import * as React from 'react';
import { Booking, Intro, BlockDetail, Floor, Product } from '../containers';
import { IBooking } from '../types';
import Navigation from '../containers/common/Navigation';
import * as ReactPopover from 'react-popover';

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

    if (activeRoute === 'PRODUCT_DETAIL') {
      return <Product />;
    }

    return null;
  };

  return (
    <div className="layout">
      <div className="grid-131">
        <Navigation
          items={booking.categoryTree}
          parentId={booking.productCategoryId}
        />
        <div />
        <Navigation
          items={booking.categoryTree}
          parentId={booking.productCategoryId}
        />
      </div>
      <div className="h-100 w-100">{renderContent()}</div>
    </div>
  );
}

export default App;
