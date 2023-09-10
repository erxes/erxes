import * as compose from 'lodash.flowright';
import { CountByTagsQueryResponse } from '../../types';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../graphql';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';

const DashboardFilterContainer = (props: {
  countByTagsQuery?: CountByTagsQueryResponse;
  tagsQuery?: TagsQueryResponse;
}) => {
  const { countByTagsQuery, tagsQuery } = props;

  const counts = countByTagsQuery?.dashboardCountByTags || {};

  return (
    <CountsByTag
      tags={(tagsQuery ? tagsQuery.tags : null) || []}
      counts={counts || {}}
      manageUrl="/tags?type=dashboard:dashboard"
      loading={tagsQuery?.loading || false}
    />
  );
};

export default compose(
  graphql<{}, CountByTagsQueryResponse, {}>(gql(queries.dashboardCountByTags), {
    name: 'countByTagsQuery'
  }),
  graphql<{}, TagsQueryResponse, { type: string }>(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.DASHBOARD
      }
    })
  })
)(DashboardFilterContainer);
