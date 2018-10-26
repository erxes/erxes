import gql from 'graphql-tag';
import Segments from 'modules/segments/containers/Filter';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries as customerQueries } from '../../graphql';
import { CountQueryResponse } from '../../types';

const SegmentFilterContainer = (props: {
  customersCountQuery: CountQueryResponse;
}) => {
  const { customersCountQuery } = props;

  const counts = customersCountQuery.customerCounts || {};

  return <Segments contentType="customer" counts={counts.bySegment || {}} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(customerQueries.customerCounts),
      {
        name: 'customersCountQuery',
        options: {
          variables: { only: 'bySegment' }
        }
      }
    )
  )(SegmentFilterContainer)
);
