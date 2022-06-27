import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '@erxes/ui/src/team/graphql';
import { CountQueryResponse } from '@erxes/ui/src/team/types';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  userCountsQuery?: CountQueryResponse;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { userCountsQuery } = props;

  const counts = (userCountsQuery ? userCountsQuery.usersTotalCount : null) || {
    bySegment: {}
  };

  return <Segments contentType="user" counts={counts.bySegment || {}} />;
};

type WrapperProps = {
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(queries.usersTotalCount), {
      name: 'userCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
