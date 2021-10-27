import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from 'erxes-ui/lib/components/CountsByTag';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from 'erxes-ui';
import {
  Counts,
  TagCountQueryResponse,
  TagsQueryResponse
} from '../../../types';
import { queries } from '../../graphql';

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
        manageUrl="/tags/integration"
        loading={(tagsQuery ? tagsQuery.loading : null) || false}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      TagCountQueryResponse,
      { type: string }
    >(gql(queries.tags), {
      name: 'tagsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: () => ({
        variables: {
          type: 'integration'
        }
      })
    })
  )(TagFilterContainer)
);
