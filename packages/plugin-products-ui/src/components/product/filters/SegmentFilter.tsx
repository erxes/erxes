import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import queries from '../../../graphql/queries';
import { ProductsCountQueryResponse } from '../../../types';

const SegmentFilterContainer = (props: {
  productsCountsQuery?: ProductsCountQueryResponse;
}) => {
  const { productsCountsQuery } = props;

  const counts = (productsCountsQuery
    ? productsCountsQuery.bySegment
    : null) || { bySegment: {} };

  return (
    <Segments contentType="contacts:product" counts={counts.bySegment || {}} />
  );
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      ProductsCountQueryResponse,
      { only: string }
    >(gql(queries.segmentProductsCounts), {
      name: 'productCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
