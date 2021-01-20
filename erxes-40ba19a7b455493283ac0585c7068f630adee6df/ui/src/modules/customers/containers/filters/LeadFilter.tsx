import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React, { useEffect, useRef, useState } from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries as integrationQuery } from '../../../settings/integrations/graphql';
import {
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

function LeadFilterContainer(props: Props) {
  const { integrationsQuery, totalCountQuery, customersCountQuery } = props;
  const defaultIntegrations = integrationsQuery
    ? integrationsQuery.integrations
    : [];
  const [integrations, setIntegrations] = useState(defaultIntegrations);

  const prevProp = useRef(integrationsQuery);

  useEffect(() => {
    const prevIntegrationsQuery = prevProp.current;

    if (
      integrationsQuery &&
      prevIntegrationsQuery &&
      integrationsQuery.integrations !== prevIntegrationsQuery.integrations
    ) {
      setIntegrations([...integrations, ...integrationsQuery.integrations]);
    }

    prevProp.current = integrationsQuery;
  }, [integrationsQuery, integrations]);

  const loadMore = () => {
    if (integrationsQuery) {
      integrationsQuery.refetch({
        perPage: 10,
        page: Math.floor(integrations.length / 10) + 1
      });
    }
  };

  const counts = (customersCountQuery
    ? customersCountQuery.customerCounts
    : null) || { byForm: {} };

  const updatedProps = {
    ...props,
    counts: counts.byForm || {},
    integrations,
    loading: integrationsQuery ? integrationsQuery.loading : false,
    loadMore,
    all:
      totalCountQuery && totalCountQuery.integrationsTotalCount
        ? totalCountQuery.integrationsTotalCount.byKind.lead
        : 0
  };

  return <LeadFilter {...updatedProps} />;
}

type WrapperProps = {
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, IntegrationsQueryResponse, {}>(
      gql(integrationQuery.integrations),
      {
        name: 'integrationsQuery',
        options: () => ({
          variables: { kind: 'lead', perPage: 10, page: 1 }
        }),
        skip: ({ loadingMainQuery }) => loadingMainQuery
      }
    ),
    graphql<WrapperProps, IntegrationsCountQueryResponse, {}>(
      gql(integrationQuery.integrationTotalCount),
      {
        name: 'totalCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery
      }
    ),
    graphql<WrapperProps, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customersCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type }) => ({
          variables: { type, only: 'byForm' }
        })
      }
    )
  )(LeadFilterContainer)
);
