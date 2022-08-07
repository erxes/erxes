import * as compose from 'lodash.flowright';

import { CountQueryResponse } from '@erxes/ui/src/team/types';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { isEnabled } from '@erxes/ui/src/utils/core';
import path from 'path';
import { queries } from '@erxes/ui/src/team/graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  userCountsQuery?: CountQueryResponse;
};

const Segments = asyncComponent(
  () =>
    isEnabled('segments') &&
    path.resolve(
      /* webpackChunkName: "SegmentFilter" */ '@erxes/ui-segments/src/containers/Filter'
    )
);

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
