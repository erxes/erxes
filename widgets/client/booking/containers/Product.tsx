import * as React from 'react';
import { Product } from '../components';
import { AppConsumer } from './AppContext';
import { ChildProps, compose, graphql } from 'react-apollo';
import { productDetail, fields } from '../graphql';
import gql from 'graphql-tag';
import {
  FieldsQueryResponse,
  IBookingData,
  ProductDetailQueryResponse
} from '../types';

type Props = {
  productId: string;
  booking: IBookingData;
  goToCategory: (categoryId: string) => void;
  showPopup: () => void;
};

type FinalProps = {
  productDetailQuery: ProductDetailQueryResponse;
  fieldsQuery: FieldsQueryResponse;
} & Props;

function ProductContainer(props: ChildProps<FinalProps>) {
  const { productDetailQuery, fieldsQuery } = props;

  if (productDetailQuery.loading || fieldsQuery.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    product: productDetailQuery.widgetsProductDetail,
    fields: fieldsQuery.widgetsFields
  };

  return <Product {...extendedProps} />;
}

const WithData = compose(
  graphql<FinalProps, {}>(gql(productDetail), {
    name: 'productDetailQuery',
    options: ({ productId }) => ({
      variables: {
        _id: productId
      }
    })
  }),
  graphql<{}, FieldsQueryResponse, { contentType: string }>(gql(fields), {
    name: 'fieldsQuery',
    options: () => ({
      variables: {
        contentType: 'product'
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
