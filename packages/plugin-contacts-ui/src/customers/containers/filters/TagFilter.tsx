import * as compose from 'lodash.flowright';

import { ITag, TagsQueryResponse } from '@erxes/ui-tags/src/types';

import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import React from 'react';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { withProps } from '@erxes/ui/src/utils';

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
  abortController?: any;
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
        options: ({ type, abortController }) => ({
          variables: { type, only: 'byTag' },
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    ),
    graphql<WrapperProps, TagsQueryResponse, { type: string }>(
      gql(tagQueries.tags),
      {
        name: 'tagsQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ abortController }) => ({
          variables: {
            type: TAG_TYPES.CUSTOMER
          },
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    )
  )(TagFilterContainer)
);
