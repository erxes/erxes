import * as compose from 'lodash.flowright';

import {
  IntegrationsCountQueryResponse,
  IntegrationsQueryResponse
} from '@erxes/ui-inbox/src/settings/integrations/types';
import React, { useEffect, useRef, useState } from 'react';

import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import LeadFilter from '../../components/list/LeadFilter';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries as integrationQuery } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { queries } from '@erxes/ui-contacts/src/customers/graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  integrationsQuery?: IntegrationsQueryResponse;
  customersCountQuery?: CountQueryResponse;
  totalCountQuery?: IntegrationsCountQueryResponse;
};

function LeadFilterContainer(props: Props) {
  const { integrationsQuery, totalCountQuery, customersCountQuery } = props;

  const defaultIntegrations = integrationsQuery
    ? integrationsQuery.integrations || []
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
  abortController?: any;
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, IntegrationsQueryResponse, {}>(
      gql(integrationQuery.integrations),
      {
        name: 'integrationsQuery',
        options: ({ abortController }) => ({
          variables: { kind: 'lead', perPage: 10, page: 1 },
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        }),
        skip: ({ loadingMainQuery }) => loadingMainQuery
      }
    ),
    graphql<WrapperProps, IntegrationsCountQueryResponse, {}>(
      gql((integrationQuery || ({} as any)).integrationTotalCount),
      {
        name: 'totalCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ abortController }) => ({
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    ),
    graphql<WrapperProps, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customersCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type, abortController }) => ({
          variables: { type, only: 'byForm' },
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    )
  )(LeadFilterContainer)
);
