import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import { TAG_TYPES } from '@erxes/ui/src/tags/constants';
import { queries as tagQueries } from '@erxes/ui/src/tags/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { TagsQueryResponse } from '@erxes/ui/src/tags/types';
import { queries } from '../graphql';
import { CountByTagsQueryResponse } from '../types';
import { isEnabled } from '@erxes/ui/src/utils/core';

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
      manageUrl="/tags/product"
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
    }),
    skip: !isEnabled('tags') ? true : false
  })
)(TagFilterContainer);
