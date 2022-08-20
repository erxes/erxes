import * as React from 'react';
import { iconClose } from '../../icons/Icons';
import { IBookingData } from '../types';
import asyncComponent from '../../AsyncComponent';

const Form = asyncComponent(() =>
  import(/* webpackChunkName: "BookingForm" */ '../containers/form/Form')
);

const Booking = asyncComponent(() =>
  import(/* webpackChunkName: "BookingMain" */ '../containers/Booking')
);

const Intro = asyncComponent(() =>
  import(/* webpackChunkName: "BookingIntro" */ '../containers/Intro')
);

const CategoryDetail = asyncComponent(() =>
  import(/* webpackChunkName: "BookingCategoryDetail" */ '../containers/CategoryDetail')
);

const Product = asyncComponent(() =>
  import(/* webpackChunkName: "BookingProduct" */ '../containers/Product')
);

const Header = asyncComponent(() =>
  import(/* webpackChunkName: "BookingHeader" */ '../containers/common/Header')
);

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
