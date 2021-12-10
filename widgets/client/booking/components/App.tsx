import * as React from 'react';
import { iconClose } from '../../icons/Icons';
import { Booking, Intro, CategoryDetail, Product } from '../containers';
import { IBookingData } from '../types';
import Header from '../containers/common/Header';
import Form from '../containers/form/Form';

type Props = {
  activeRoute: string;
  booking: IBookingData;
  isFormVisible: boolean;
  containerClass: string;
  closePopup: () => void;
};

function App({
  booking,
  activeRoute,
  isFormVisible,
  containerClass,
  closePopup
}: Props) {
  const renderContent = () => {
    if (activeRoute === 'INTRO') {
      return <Intro />;
    }

    if (activeRoute === 'BOOKING') {
      return <Booking />;
    }

    if (activeRoute === 'CATEGORY_DETAIL') {
      return <CategoryDetail />;
    }

    if (activeRoute === 'PRODUCT_DETAIL') {
      return <Product />;
    }

    return null;
  };

  const renderCloseButton = () => {
    return (
      <a className="close" onClick={closePopup} title="Close">
        {iconClose()}
      </a>
    );
  };

  const renderForm = () => {
    if (isFormVisible) {
      return (
        <div className={containerClass} style={{ zIndex: 10000 }}>
          <Form />
          {renderCloseButton()}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ fontFamily: booking.style.baseFont }}>
      <div className="erxes-content">{renderForm()}</div>
      <div className="booking-main-container">
        <Header
          items={booking.categoryTree}
          parentId={booking.productCategoryId}
        />
        <div className="booking-main-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
