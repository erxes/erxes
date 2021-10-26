import * as React from 'react';
import CategoryDetail from '../components/CategoryDetail';
import { AppConsumer } from './AppContext';
import { ChildProps, compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { productCategory } from '../graphql';
import { IProductCategory } from '../../types';

type Props = {
  goToBookings: () => void;
  categoryId?: string;
};

type QueryResponse = {
  widgetsProductCategory: IProductCategory;
};

function CategoryDetailContainer(props: ChildProps<Props, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    category: data.widgetsProductCategory
  };

  return <CategoryDetail {...extendedProps} />;
}

const WithData = compose(
  graphql<Props, QueryResponse>(gql(productCategory), {
    options: ({ categoryId }) => ({
      variables: {
        _id: categoryId
      }
    })
  })
)(CategoryDetailContainer);

const WithContext = () => (
  <AppConsumer>
    {({ activeCategory, goToBookings, getBooking }) => {
      const booking = getBooking();
      return (
        <WithData
          goToBookings={goToBookings}
          categoryId={activeCategory}
          booking={booking}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
