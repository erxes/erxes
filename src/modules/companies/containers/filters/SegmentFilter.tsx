import gql from 'graphql-tag';
import Segments from 'modules/segments/containers/Filter';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';

type CountQueryResponse = {
  companyCounts: { [key: string]: number };
  loading: boolean;
};

const SegmentFilterContainer = (props: {
  companyCountsQuery: CountQueryResponse;
}) => {
  const { companyCountsQuery } = props;

  const counts = companyCountsQuery.companyCounts || {};

  return <Segments contentType="company" counts={counts.bySegment || {}} />;
};

export default compose(
  graphql<{}, CountQueryResponse, { only: string }>(
    gql(queries.companyCounts),
    {
      name: 'companyCountsQuery',
      options: {
        variables: { only: 'bySegment' }
      }
    }
  )
)(SegmentFilterContainer);
