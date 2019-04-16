import gql from 'graphql-tag';
import Segments from 'modules/segments/containers/Filter';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries as customerQueries } from '../../graphql';
import { CountQueryResponse } from '../../types';

const SegmentFilterContainer = (props: {
  customersCountQuery?: CountQueryResponse;
}) => {
  const { customersCountQuery } = props;

  const counts = (customersCountQuery
    ? customersCountQuery.customerCounts
    : null) || { bySegment: {} };

  return <Segments contentType="customer" counts={counts.bySegment} />;
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(customerQueries.customerCounts), {
      name: 'customersCountQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
