import * as React from 'react';
import { Product } from '../components';
import { AppConsumer } from './AppContext';
import { ChildProps, compose, graphql } from 'react-apollo';
import { productDetail } from '../graphql';
import gql from 'graphql-tag';
import { IBookingData } from '../types';
import { IProduct } from '../../types';

type Props = {
  productId: string;
  booking: IBookingData;
  goToBookings: () => void;
  showPopup: () => void;
};

type QueryResponse = {
  widgetsProductDetail: IProduct;
};

function ProductContainer(props: ChildProps<Props, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    product: data.widgetsProductDetail
  };

  return <Product {...extendedProps} />;
}

const WithData = compose(
  graphql<Props, QueryResponse>(gql(productDetail), {
    options: ({ productId }) => ({
      variables: {
        _id: productId
      }
    })
  })
)(ProductContainer);

const WithContext = () => (
  <AppConsumer>
    {({ activeProduct, getBooking, goToBookings, showPopup }) => {
      const booking = getBooking();
      return (
        <WithData
          productId={activeProduct}
          booking={booking}
          goToBookings={goToBookings}
          showPopup={showPopup}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
