import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import Home from '../components/Home';

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props & {
    getNeighborItems: any;
  };
class HomeContainer extends React.Component<FinalProps> {
  render() {
    const { getNeighborItems, queryParams } = this.props;

    if (getNeighborItems.loading) {
      return <div>...</div>;
    }

    if (getNeighborItems.error) {
      return <div>{getNeighborItems.error.message}</div>;
    }

    return (
      <Home
        type={queryParams.type}
        data={getNeighborItems.getNeighborItems || []}
        refetch={getNeighborItems.refetch}
      />
    );
  }
}

export default compose(
  graphql(gql(queries.getNeighborItems), {
    name: 'getNeighborItems',
    options: ({ queryParams }: any) => ({
      variables: {
        type: queryParams.type || 'kindergarden'
      }
    })
  })
)(HomeContainer);
