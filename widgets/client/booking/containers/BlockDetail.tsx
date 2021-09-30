import * as React from 'react';
import BlockDetail from '../components/BlockDetail';
import { AppConsumer } from './AppContext';
import { IProductCategory } from '../types';
import { ChildProps, compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { productCategory } from '../graphql';

type Props = {
  goToBookings?: () => void;
  blockId?: string | null;
  categoryId?: string;
};

type QueryResponse = {
  widgetsProductCategory: IProductCategory;
};

function BlockDetailContainer(props: ChildProps<Props, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    block: data.widgetsProductCategory
  };

  return <BlockDetail {...extendedProps} />;
}

const WithData = compose(
  graphql<Props, QueryResponse>(gql(productCategory), {
    options: ({ blockId }) => ({
      variables: {
        _id: blockId
      }
    })
  })
)(BlockDetailContainer);

const WithContext = () => (
  <AppConsumer>
    {({ activeBlock, goToBookings }) => {
      return <WithData goToBookings={goToBookings} blockId={activeBlock} />;
    }}
  </AppConsumer>
);

export default WithContext;
