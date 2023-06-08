import * as compose from 'lodash.flowright';

import { Counts } from '@erxes/ui/src/types';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import React from 'react';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { withProps } from '@erxes/ui/src/utils';

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
