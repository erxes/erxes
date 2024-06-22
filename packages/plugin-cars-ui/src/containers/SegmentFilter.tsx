import { gql, useQuery } from '@apollo/client';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { queries } from '../graphql';
import { CountQueryResponse } from '../types';

const SegmentFilterContainer = (props: {
  loadingMainQuery: boolean;
  only?: string;
}) => {
  const { loadingMainQuery } = props;

  const carsCountsQuery = useQuery<CountQueryResponse>(gql(queries.carCounts), {
    variables: { only: 'bySegment' },
    skip: loadingMainQuery,
  });

  const counts = (carsCountsQuery
    ? carsCountsQuery?.data?.carCounts
    : null) || {
    bySegment: {},
  };

  return <Segments contentType="cars:car" counts={counts.bySegment || {}} />;
};

export default SegmentFilterContainer;
