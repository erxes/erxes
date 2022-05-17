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

const TagFilterContainer = (props: {
  countByTagsQuery: CountByTagsQueryResponse;
  tagsQuery?: TagsQueryResponse;
}) => {
  const { countByTagsQuery, tagsQuery } = props;

  const counts = countByTagsQuery.productTemplateCountByTags || {};

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
  graphql<{}, CountByTagsQueryResponse, {}>(
    gql(queries.productTemplateCountByTags),
    {
      name: 'countByTagsQuery'
    }
  ),
  graphql<{}, TagsQueryResponse, { type: string }>(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.PRODUCT_TEMPLATE
      }
    })
  })
)(TagFilterContainer);
