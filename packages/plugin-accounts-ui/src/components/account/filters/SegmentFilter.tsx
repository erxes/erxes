import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import queries from '../../../graphql/queries';
import { AccountsGroupCountsQueryResponse } from '../../../types';

const SegmentFilterContainer = (props: {
  accountsCountsQuery?: AccountsGroupCountsQueryResponse;
}) => {
  const { accountsCountsQuery } = props;

  const counts = (accountsCountsQuery
    ? accountsCountsQuery.accountsGroupsCounts
    : null) || { bySegment: {} };

  return (
    <Segments contentType="accounts:account" counts={counts.bySegment || {}} />
  );
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      AccountsGroupCountsQueryResponse,
      { only: string }
    >(gql(queries.accountsGroupCounts), {
      name: 'accountCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'bySegment' }
      }
    })
  )(SegmentFilterContainer)
);
