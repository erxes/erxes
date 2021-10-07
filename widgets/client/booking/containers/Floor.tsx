import * as React from 'react';
import { Floor } from '../components';
import { AppConsumer } from './AppContext';
import { graphql, compose, ChildProps } from 'react-apollo';
import gql from 'graphql-tag';
import { productCategory } from '../graphql';
import { IBooking, IProductCategory } from '../types';

type Props = {
  floorId?: string;
  goToBookings: () => void;
  booking: IBooking;
};

type QueryResponse = {
  widgetsProductCategory: IProductCategory;
};

function FloorContainer(props: ChildProps<Props, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    floor: data.widgetsProductCategory
  };

  return <Floor {...extendedProps} />;
}

const WithData = compose(
  graphql<Props, QueryResponse>(gql(productCategory), {
    options: ({ floorId }) => ({
      variables: {
        _id: floorId
      }
    })
  })
)(FloorContainer);

const WithContext = () => (
  <AppConsumer>
    {({ activeFloor, goToBookings, getBooking }) => {
      const booking = getBooking();

      return (
        <WithData
          floorId={activeFloor}
          goToBookings={goToBookings}
          booking={booking}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
