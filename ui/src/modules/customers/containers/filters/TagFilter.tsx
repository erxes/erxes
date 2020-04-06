import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from 'modules/common/components/CountsByTag';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
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
      manageUrl="/tags/customer"
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
