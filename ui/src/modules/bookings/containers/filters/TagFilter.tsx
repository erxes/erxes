import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from 'modules/common/components/CountsByTag';
import { TagCountQueryResponse } from 'modules/engage/types';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { TagsQueryResponse } from '../../../tags/types';
import { Counts } from '../../types';

type Props = {
  counts: Counts;
};

type FinalProps = {
  tagsQuery?: TagsQueryResponse;
} & Props;

function TagFilterContainer(props: FinalProps) {
  const { counts, tagsQuery } = props;

  return (
    <CountsByTag
      tags={(tagsQuery ? tagsQuery.tags : null) || []}
      counts={counts || {}}
      manageUrl="/tags/integration"
      loading={(tagsQuery ? tagsQuery.loading : null) || false}
    />
  );
}

export default withProps<Props>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      TagCountQueryResponse,
      { type: string }
    >(gql(tagQueries.tags), {
      name: 'tagsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: () => ({
        variables: {
          type: TAG_TYPES.INTEGRATION
        }
      })
    })
  )(TagFilterContainer)
);
