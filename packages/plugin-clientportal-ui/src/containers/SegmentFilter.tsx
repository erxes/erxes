import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { ClientPortalUserTotalCountQueryResponse } from '../types';

const SegmentFilterContainer = (props: {
  clientPortalUserCountsQuery?: ClientPortalUserTotalCountQueryResponse;
}) => {
  const { clientPortalUserCountsQuery } = props;

  const counts = (clientPortalUserCountsQuery
    ? clientPortalUserCountsQuery.clientPortalUserCounts
    : null) || {
    bySegment: {}
  };

  return (
    <Segments contentType="clientportal:user" counts={counts.bySegment || {}} />
  );
};

type Props = {
  loadingMainQuery: boolean;
};

export default withProps<Props>(
  compose(
    graphql<Props, ClientPortalUserTotalCountQueryResponse, { only: string }>(
      gql(queries.clientPortalUserCounts),
      {
        name: 'clientPortalUserCountsQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: {
          variables: { only: 'bySegment' }
        }
      }
    )
  )(SegmentFilterContainer)
);
