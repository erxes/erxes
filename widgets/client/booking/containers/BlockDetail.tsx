import * as React from 'react';
import { graphql, ChildProps } from 'react-apollo';
import gql from 'graphql-tag';
import { productCategories } from '../graphql';
import BlockDetail from '../components/BlockDetail';
import { AppConsumer } from './AppContext';
import { IProductCategory } from '../types';

type QueryResponse = {
  widgetsProductCategories: IProductCategory[];
};

function BlockDetailContainer(props: ChildProps<{}, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  return <BlockDetail floors={data.widgetsProductCategories || []} />;
}

const WithData = graphql<{ block: IProductCategory | null }, QueryResponse>(
  gql(productCategories),
  {
    options: ({ block }) => ({
      variables: {
        parentId: block && block._id
      }
    })
  }
)(BlockDetailContainer);

const WithContext = () => {
  return (
    <AppConsumer>
      {({ activeBlock }) => {
        return <WithData block={activeBlock} />;
      }}
    </AppConsumer>
  );
};

export default WithContext;
