import gql from 'graphql-tag';
import { CountsByTag } from 'modules/common/components';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { ITag, TagsQueryResponse } from '../../../tags/types';
import { queries as customerQueries } from '../../graphql';
import { CountQueryResponse } from '../../types';

const TagFilterContainer = (props: {
  customersCountQuery?: CountQueryResponse;
  tagsQuery?: TagsQueryResponse;
}) => {
  const { customersCountQuery, tagsQuery } = props;

  const counts = (customersCountQuery
    ? customersCountQuery.customerCounts
    : null) || { byTag: {} };

  let tagsLoading = false;
  let tags: ITag[] = [];

  if (tagsQuery) {
    tagsLoading = tagsQuery.loading || false;
    tags = tagsQuery.tags || [];
  }

  return (
    <CountsByTag
      tags={tags}
      counts={counts.byTag || {}}
      manageUrl="tags/customer"
      loading={tagsLoading}
    />
  );
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(customerQueries.customerCounts), {
      name: 'customersCountQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'byTag' }
      }
    }),
    graphql<{ loadingMainQuery: boolean }, TagsQueryResponse, { type: string }>(
      gql(tagQueries.tags),
      {
        name: 'tagsQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: () => ({
          variables: {
            type: TAG_TYPES.CUSTOMER
          }
        })
      }
    )
  )(TagFilterContainer)
);
