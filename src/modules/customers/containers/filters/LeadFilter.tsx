import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { IntegrationsQueryResponse } from '../../../settings/integrations/types';
import LeadFilter from '../../components/list/LeadFilter';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  integrationsQuery?: IntegrationsQueryResponse;
  customersCountQuery?: CountQueryResponse;
};

const LeadFilterContainer = (props: Props) => {
  const { integrationsQuery, customersCountQuery } = props;

  const counts = (customersCountQuery
    ? customersCountQuery.customerCounts
    : null) || { byForm: {} };
  const integrations =
    (integrationsQuery ? integrationsQuery.integrations : null) || [];

  const updatedProps = {
    ...props,
    counts: counts.byForm || {},
    integrations,
    loading: integrationsQuery ? integrationsQuery.loading : false
  };

  return <LeadFilter {...updatedProps} />;
};

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<{ loadingMainQuery: boolean }, IntegrationsQueryResponse, {}>(
      gql`
        query integrations {
          integrations(kind: "lead") {
            _id
            name
            form {
              _id
            }
          }
        }
      `,
      {
        name: 'integrationsQuery',
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
