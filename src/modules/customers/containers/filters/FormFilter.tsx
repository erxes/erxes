import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { FormFilter } from '../../components';
import { queries } from '../../graphql';

type Props = {
  integrationsQuery: any;
  customersCountQuery: any;
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

export default compose(
  graphql(
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
  graphql(gql(queries.customerCounts), {
    name: 'customersCountQuery',
    options: {
      variables: { only: 'byForm' }
    }
  })
)(FormFilterContainer);
