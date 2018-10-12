import gql from 'graphql-tag';
import Segments from 'modules/segments/containers/Filter';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';

const SegmentFilterContainer = (props: { companyCountsQuery: any }) => {
  const { companyCountsQuery } = props;

  const counts = companyCountsQuery.companyCounts || {};

  return <Segments contentType="company" counts={counts.bySegment || {}} />;
};

export default compose(
  graphql(gql(queries.companyCounts), {
    name: 'companyCountsQuery',
    options: {
      variables: { only: 'bySegment' }
    }
  })
)(SegmentFilterContainer);
