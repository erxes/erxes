import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from 'modules/common/components/CountsByTag';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { TagsQueryResponse } from '../../../tags/types';
import { queries as companyQueries } from '../../graphql';
import { CountQueryResponse } from '../../types';

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
      manageUrl="tags/company"
      loading={(tagsQuery ? tagsQuery.loading : null) || false}
    />
  );
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(companyQueries.companyCounts), {
      name: 'companyCountsQuery',
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
            type: TAG_TYPES.COMPANY
          }
        })
      }
    )
  )(TagFilterContainer)
);
