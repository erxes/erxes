import * as compose from 'lodash.flowright';

import { CountByTagsQueryResponse, CountQueryResponse } from '../types';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import React from 'react';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';

const TagFilterContainer = (props: {
  countByTagsQuery: CountByTagsQueryResponse;
  tagsQuery?: TagsQueryResponse;
}) => {
  const { countByTagsQuery, tagsQuery } = props;

  const counts = countByTagsQuery.carCountByTags || {};

  return (
    <CountsByTag
      tags={(tagsQuery ? tagsQuery.tags : null) || []}
      counts={counts}
      manageUrl="/settings/tags?type=products:product"
      loading={(tagsQuery ? tagsQuery.loading : null) || false}
    />
  );
};

export default compose(
  graphql<{}, CountByTagsQueryResponse, {}>(gql(queries.carCountByTags), {
    name: 'countByTagsQuery'
  }),

  graphql<{}, TagsQueryResponse, { type: string }>(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: 'cars:car'
      }
    })
  })
)(TagFilterContainer);
