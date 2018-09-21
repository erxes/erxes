import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { FormFilter } from '../components';

type Props = {
  integrationsQuery: any;
  counts: any;
};

const FormFilterContainer = (props: Props) => {
  const { integrationsQuery } = props;

  const updatedProps = {
    ...props,
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
  )
)(FormFilterContainer);
