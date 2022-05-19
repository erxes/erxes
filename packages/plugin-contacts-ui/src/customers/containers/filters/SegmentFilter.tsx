import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';

type Props = {
  customersCountQuery?: CountQueryResponse;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { customersCountQuery, type } = props;

  const counts = (customersCountQuery
    ? customersCountQuery.customerCounts
    : null) || { bySegment: {} };

  return (
    <Segments
      contentType={`contacts:${type}`}
      counts={counts.bySegment || {}}
    />
  );
};

type WrapperProps = {
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, CountQueryResponse, { only: string }>(
      gql(customerQueries.customerCounts),
      {
        name: 'customersCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type }) => ({
          variables: { type, only: 'bySegment' }
        })
      }
    )
  )(SegmentFilterContainer)
);
