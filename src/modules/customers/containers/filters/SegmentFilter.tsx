import gql from 'graphql-tag';
import Segments from 'modules/segments/containers/Filter';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries as customerQueries } from '../../graphql';

const SegmentFilterContainer = (props: { customersCountQuery: any }) => {
  const { customersCountQuery } = props;

  const counts = customersCountQuery.customerCounts || {};

  return <Segments contentType="customer" counts={counts.bySegment || {}} />;
};

export default compose(
  graphql(gql(customerQueries.customerCounts), {
    name: 'customersCountQuery',
    options: {
      variables: { only: 'bySegment' }
    }
  })
)(SegmentFilterContainer);
