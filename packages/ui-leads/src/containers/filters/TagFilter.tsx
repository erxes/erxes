import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import { TAG_TYPES } from '@erxes/ui/src/tags/constants';
import { queries as tagQueries } from '@erxes/ui/src/tags/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { TagsQueryResponse } from '@erxes/ui/src/tags/types';
import { Counts } from '@erxes/ui/src/types';

type Props = {
  counts: Counts;
};

type FinalProps = {
  tagsQuery?: TagsQueryResponse;
} & Props;

class TagFilterContainer extends React.Component<FinalProps> {
  render() {
    const { counts, tagsQuery } = this.props;

    return (
      <CountsByTag
        tags={(tagsQuery ? tagsQuery.tags : null) || []}
        counts={counts || {}}
        manageUrl="/tags?type=inbox:integration"
        loading={(tagsQuery ? tagsQuery.loading : null) || false}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{ loadingMainQuery: boolean }, Counts, { type: string }>(
      gql(tagQueries.tags),
      {
        name: 'tagsQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: () => ({
          variables: {
            type: TAG_TYPES.INTEGRATION
          }
        })
      }
    )
  )(TagFilterContainer)
);
