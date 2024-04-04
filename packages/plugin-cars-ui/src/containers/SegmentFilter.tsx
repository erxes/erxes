import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { CountQueryResponse } from '../types';

const SegmentFilterContainer = (props: {
  carsCountsQuery?: CountQueryResponse;
}) => {
  const { carsCountsQuery } = props;

  const counts = (carsCountsQuery ? carsCountsQuery.carCounts : null) || {
    bySegment: {}
  };

  return <Segments contentType="cars:car" counts={counts.bySegment || {}} />;
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(queries.carCounts), {
      name: 'carsCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
