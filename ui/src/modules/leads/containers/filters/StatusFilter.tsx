import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import StatusFilter from 'modules/leads/components/StatusFilter';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  queryParams: any;
  refetch?: () => void;
};

type FinalProps = {
  integrationsTotalCountQuery: CountQueryResponse;
} & Props;

class StatusFilterContainer extends React.Component<FinalProps> {
  render() {
    const { integrationsTotalCountQuery, refetch } = this.props;

    const counts = (integrationsTotalCountQuery
      ? integrationsTotalCountQuery.integrationsTotalCount
      : null) || { byStatus: {} };

    if (refetch) {
      this.refetch();
    }

    return (
      <StatusFilter
        counts={counts.byStatus || {}}
        loading={
          (integrationsTotalCountQuery
            ? integrationsTotalCountQuery.loading
            : null) || false
        }
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
  )(StatusFilterContainer)
);
