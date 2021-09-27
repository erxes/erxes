import * as React from 'react';
import { graphql, ChildProps } from 'react-apollo';
import gql from 'graphql-tag';
import { productCategories } from '../graphql';
import BlockDetail from '../components/BlockDetail';
import { AppConsumer } from './AppContext';
import { IProductCategory } from '../types';

type Props = {
  goToBookings: () => void;
  block: IProductCategory | null;
};

type QueryResponse = {
  widgetsProductCategories: IProductCategory[];
};

function BlockDetailContainer(props: ChildProps<Props, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    floors: data.widgetsProductCategories || []
  };

  return <BlockDetail {...extendedProps} />;
}

const WithData = graphql<Props, QueryResponse>(gql(productCategories), {
  options: ({ block }) => ({
    variables: {
      parentId: block && block._id
    }
  })
})(BlockDetailContainer);

const WithContext = () => {
  return (
    <AppConsumer>
      {({ activeBlock, goToBookings }) => {
        return <WithData block={activeBlock} goToBookings={goToBookings} />;
      }}
    </AppConsumer>
  );
};

export default WithContext;
