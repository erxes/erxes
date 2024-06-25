import * as React from 'react';
import Product from '../components/Product';
import { GET_BOOKING_PRODUCT_WITH_FIELDS } from '../graphql';
import { IProductWithFields } from '../types';
import { useAppContext } from './AppContext';
import { useQuery } from '@apollo/react-hooks';

type QueryResponse = {
  widgetsBookingProductWithFields: IProductWithFields;
};

function ProductContainer() {
  const { activeProduct, getBooking, showPopup, goToCategory } =
    useAppContext();

  const { data, loading } = useQuery(GET_BOOKING_PRODUCT_WITH_FIELDS, {
    variables: {
      _id: activeProduct,
    },
  });

  const booking = getBooking();

  if (!data || loading) {
    return null;
  }

  const productWithFields =
    data.widgetsBookingProductWithFields || ({} as IProductWithFields);

  const extendedProps = {
    booking,
    goToCategory,
    showPopup,
    product: productWithFields.product,
    fields: productWithFields.fields,
  };

  return <Product {...extendedProps} />;
}

export default ProductContainer;
