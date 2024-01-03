import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import queries from '../../../graphql/queries';
import { ProductsGroupCountsQueryResponse } from '../../../types';

const SegmentFilterContainer = (props: {
  productsCountsQuery?: ProductsGroupCountsQueryResponse;
}) => {
  const { productsCountsQuery } = props;

  const counts = (productsCountsQuery
    ? productsCountsQuery.productsGroupsCounts
    : null) || { bySegment: {} };

  return (
    <Segments contentType="products:product" counts={counts.bySegment || {}} />
  );
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      ProductsGroupCountsQueryResponse,
      { only: string }
    >(gql(queries.productsGroupCounts), {
      name: 'productCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
