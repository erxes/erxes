import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Deal } from '../../components';
import { queries } from '../../graphql';

class DealContainer extends React.Component<{ dealDetailQuery: any }> {
  render() {
    const { dealDetailQuery } = this.props;

    if (dealDetailQuery.loading) {
      return <Spinner objective />;
    }

    const deal = dealDetailQuery.dealDetail;

    const extendedProps = {
      ...this.props,
      deal
    };

    return <Deal {...extendedProps} />;
  }
}

export default compose(
  graphql(gql(queries.dealDetail), {
    name: 'dealDetailQuery',
    options: ({ dealId }: { dealId: string }) => ({
      variables: {
        _id: dealId
      }
    })
  })
)(DealContainer);
