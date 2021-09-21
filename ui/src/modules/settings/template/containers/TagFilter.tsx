import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from 'modules/common/components/CountsByTag';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { TagsQueryResponse } from '../../../tags/types';
import { queries } from '../graphql';
import { CountByTagsQueryResponse } from '../types';

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
    })
  })
)(TagFilterContainer);
