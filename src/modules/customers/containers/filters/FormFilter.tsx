import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { IntegrationsQueryResponse } from '../../../settings/integrations/types';
import { FormFilter } from '../../components';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  integrationsQuery: IntegrationsQueryResponse;
  customersCountQuery: CountQueryResponse;
  counts: { [key: string]: number };
};

const FormFilterContainer = (props: Props) => {
  const { integrationsQuery, customersCountQuery } = props;

  const counts = customersCountQuery.customerCounts || {};

  const updatedProps = {
    ...props,
    counts: counts.byForm || {},
    integrations: integrationsQuery.integrations || [],
    loading: integrationsQuery.loading
  };

  return <FormFilter {...updatedProps} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, IntegrationsQueryResponse, {}>(
      gql`
        query integrations {
          integrations(kind: "form") {
            _id
            name
            form {
              _id
            }
          }
        }
      `,
      {
        name: 'integrationsQuery'
      }
    ),
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customersCountQuery',
        options: {
          variables: { only: 'byForm' }
        }
      }
    )
  )(FormFilterContainer)
);
