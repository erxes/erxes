import * as compose from 'lodash.flowright';

import { CountByTagsQueryResponse } from '../types';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import React from 'react';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
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

  const counts = countByTagsQuery.productCountByTags || {};

  return (
    <CountsByTag
      tags={(tagsQuery ? tagsQuery.tags : null) || []}
      counts={counts}
      manageUrl="/tags?type=products:product"
      loading={(tagsQuery ? tagsQuery.loading : null) || false}
    />
  );
};

export default compose(
  graphql<{}, CountByTagsQueryResponse, {}>(gql(queries.productCountByTags), {
    name: 'countByTagsQuery'
  }),
  graphql<{}, TagsQueryResponse, { type: string }>(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.PRODUCT
      }
    })
  })
)(TagFilterContainer);
