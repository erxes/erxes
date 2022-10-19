import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import queries from '../../../graphql/queries';
import { CountQueryResponse } from '../../../types';

const SegmentFilterContainer = (props: {
  productsCountsQuery?: CountQueryResponse;
}) => {
  const { productsCountsQuery } = props;

  const counts = (productsCountsQuery
    ? productsCountsQuery.productCounts
    : null) || { bySegment: {} };

  return (
    <Segments contentType="products:product" counts={counts.bySegment || {}} />
  );
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(queries.productCounts), {
      name: 'productCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
