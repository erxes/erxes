import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import { TAG_TYPES } from '@erxes/ui/src/tags/constants';
import { queries as tagQueries } from '@erxes/ui/src/tags/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { ITag, TagsQueryResponse } from '@erxes/ui/src/tags/types';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';

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
      manageUrl="/tags?type=contacts:customer"
      loading={tagsLoading}
    />
  );
};

type WrapperProps = {
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, CountQueryResponse, { only: string }>(
      gql(customerQueries.customerCounts),
      {
        name: 'customersCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type }) => ({
          variables: { type, only: 'byTag' }
        })
      }
    ),
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
