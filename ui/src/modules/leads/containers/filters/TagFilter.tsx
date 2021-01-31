import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import CountsByTag from 'modules/common/components/CountsByTag';
import { TagCountQueryResponse } from 'modules/engage/types';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import { TAG_TYPES } from 'modules/tags/constants';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { TagsQueryResponse } from '../../../tags/types';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  queryParams: any;
  refetch?: () => void;
};

type FinalProps = {
  tagsQuery?: TagsQueryResponse;
  integrationsTotalCountQuery: CountQueryResponse;
} & Props;

class TagFilterContainer extends React.Component<FinalProps> {
  render() {
    const { integrationsTotalCountQuery, tagsQuery, refetch } = this.props;

    const counts = (integrationsTotalCountQuery
      ? integrationsTotalCountQuery.integrationsTotalCount
      : null) || { byTag: {} };

    if (refetch) {
      this.refetch();
    }

    return (
      <CountsByTag
        tags={(tagsQuery ? tagsQuery.tags : null) || []}
        counts={counts.byTag || {}}
        manageUrl="/tags/integration"
        loading={(tagsQuery ? tagsQuery.loading : null) || false}
      />
    );
  }

  refetch() {
    const { integrationsTotalCountQuery } = this.props;

    integrationsTotalCountQuery.refetch();
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
          type: TAG_TYPES.INTEGRATION
        }
      })
    }),
    graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
      name: 'integrationsTotalCountQuery',
      skip: ({ queryParams }) => queryParams.loadingMainQuery,
      options: ({ queryParams }) => ({
        variables: {
          kind: INTEGRATION_KINDS.LEAD,
          tag: queryParams.queryParams.tag,
          status: queryParams.queryParams.status,
          brandId: queryParams.queryParams.brand
        }
      })
    })
  )(TagFilterContainer)
);
