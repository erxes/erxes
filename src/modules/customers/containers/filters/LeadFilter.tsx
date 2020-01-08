import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries as integrationQuery } from '../../../settings/integrations/graphql';
import {
  IIntegration,
  IntegrationsCountQueryResponse,
  IntegrationsQueryResponse
} from '../../../settings/integrations/types';
import LeadFilter from '../../components/list/LeadFilter';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  integrationsQuery?: IntegrationsQueryResponse;
  customersCountQuery?: CountQueryResponse;
  totalCountQuery?: IntegrationsCountQueryResponse;
};

type State = {
  integrations: IIntegration[];
};

class LeadFilterContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      integrations: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { integrationsQuery } = this.props;

    if (
      integrationsQuery &&
      prevProps.integrationsQuery &&
      integrationsQuery.integrations !==
        prevProps.integrationsQuery.integrations
    ) {
      this.setState({
        integrations: [
          ...prevState.integrations,
          ...integrationsQuery.integrations
        ]
      });
    }
  }

  loadMore = () => {
    const { integrationsQuery } = this.props;

    if (integrationsQuery) {
      const { integrations } = this.state;

      integrationsQuery.refetch({
        perPage: 10,
        page: Math.floor(integrations.length / 10) + 1
      });
    }
  };

  render() {
    const {
      integrationsQuery,
      totalCountQuery,
      customersCountQuery
    } = this.props;

    const counts = (customersCountQuery
      ? customersCountQuery.customerCounts
      : null) || { byForm: {} };

    const updatedProps = {
      ...this.props,
      counts: counts.byForm || {},
      integrations: this.state.integrations,
      loading: integrationsQuery ? integrationsQuery.loading : false,
      loadMore: this.loadMore,
      all:
        totalCountQuery && totalCountQuery.integrationsTotalCount
          ? totalCountQuery.integrationsTotalCount.byKind.lead
          : 0
    };

    return <LeadFilter {...updatedProps} />;
  }
}

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<{ loadingMainQuery: boolean }, IntegrationsQueryResponse, {}>(
      gql(integrationQuery.integrations),
      {
        name: 'integrationsQuery',
        options: () => ({
          variables: { kind: 'lead', perPage: 10, page: 1 }
        }),
        skip: ({ loadingMainQuery }) => loadingMainQuery
      }
    ),
    graphql<{ loadingMainQuery: boolean }, IntegrationsCountQueryResponse, {}>(
      gql(integrationQuery.integrationTotalCount),
      {
        name: 'totalCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery
      }
    ),
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(queries.customerCounts), {
      name: 'customersCountQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'byForm' }
      }
    })
  )(LeadFilterContainer)
);
