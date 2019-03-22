import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import Segments from 'modules/segments/containers/Filter';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

const SegmentFilterContainer = (props: {
  companyCountsQuery?: CountQueryResponse;
}) => {
  const { companyCountsQuery } = props;

  const counts = (companyCountsQuery
    ? companyCountsQuery.companyCounts
    : null) || { bySegment: {} };

  return <Segments contentType="company" counts={counts.bySegment || {}} />;
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(queries.companyCounts), {
      name: 'companyCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
