import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../graphql';
import { CountQueryResponse } from '../types';

type Props = {
  carCountQuery?: CountQueryResponse;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { carCountQuery } = props;

  const counts = (carCountQuery ? carCountQuery.carCounts : null) || {
    bySegment: {}
  };

  return (
    <Segments contentType={'tumentech:car'} counts={counts.bySegment || {}} />
  );
};

type WrapperProps = {
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, any, { only: string }>(gql(queries.carCounts), {
      name: 'carCountQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: () => ({
        variables: { type: 'car', only: 'bySegment' }
      })
    })
  )(SegmentFilterContainer)
);
