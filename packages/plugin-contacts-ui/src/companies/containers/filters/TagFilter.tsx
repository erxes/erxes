import * as compose from 'lodash.flowright';

import { CountQueryResponse } from '../../types';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import React from 'react';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { queries as companyQueries } from '../../graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { withProps } from '@erxes/ui/src/utils';

const TagFilterContainer = (props: {
  companyCountsQuery?: CountQueryResponse;
  tagsQuery?: TagsQueryResponse;
}) => {
  const { companyCountsQuery, tagsQuery } = props;

  const counts = (companyCountsQuery
    ? companyCountsQuery.companyCounts
    : null) || { byTag: {} };

  return (
    <CountsByTag
      tags={(tagsQuery ? tagsQuery.tags : null) || []}
      counts={counts.byTag || {}}
      manageUrl="/tags?type=contacts:company"
      loading={(tagsQuery ? tagsQuery.loading : null) || false}
    />
  );
};

type Props = {
  loadingMainQuery: boolean;
  abortController?;
};

export default withProps<Props>(
  compose(
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(companyQueries.companyCounts),
      {
        name: 'companyCountsQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ abortController }) => ({
          variables: { only: 'byTag' },
          context: {
            fetchoptions: { signal: abortController && abortController.signal }
          }
        })
      }
    ),
    graphql<Props, TagsQueryResponse, { type: string }>(gql(tagQueries.tags), {
      name: 'tagsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: ({ abortController }) => ({
        variables: { type: TAG_TYPES.COMPANY },
        context: {
          fetchoptions: { signal: abortController && abortController.signal }
        }
      })
    })
  )(TagFilterContainer)
);
