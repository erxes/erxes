import * as React from 'react';
import { Product } from '../components';
import { AppConsumer } from './AppContext';
import { ChildProps, compose, graphql } from 'react-apollo';
import { bookingProductWithFields } from '../graphql';
import gql from 'graphql-tag';
import { IBookingData, IProductWithFields } from '../types';

type Props = {
  productId: string;
  booking: IBookingData;
  goToCategory: (categoryId: string) => void;
  showPopup: () => void;
};

type QueryResponse = {
  widgetsBookingProductWithFields: IProductWithFields;
};

function ProductContainer(props: ChildProps<Props, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const productWithFields =
    data.widgetsBookingProductWithFields || ({} as IProductWithFields);

  const extendedProps = {
    ...props,
    product: productWithFields.product,
    fields: productWithFields.fields
  };

  return <Product {...extendedProps} />;
}

const WithData = compose(
  graphql<Props, QueryResponse>(gql(bookingProductWithFields), {
    options: ({ productId }) => ({
      variables: {
        _id: productId
      }
    })
  })
)(ProductContainer);

const WithContext = () => (
  <AppConsumer>
    {({ activeProduct, getBooking, showPopup, goToCategory }) => {
      const booking = getBooking();
      return (
        <WithData
          productId={activeProduct}
          booking={booking}
          goToCategory={goToCategory}
          showPopup={showPopup}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
