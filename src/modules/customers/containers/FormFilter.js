import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FormFilter } from '../components';

const FormFilterContainer = props => {
  const { integrationsQuery } = props;

  const updatedProps = {
    ...props,
    integrations: integrationsQuery.integrations || [],
    loading: integrationsQuery.loading
  };

  return <FormFilter {...updatedProps} />;
};

FormFilterContainer.propTypes = {
  integrationsQuery: PropTypes.object,
  counts: PropTypes.object
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
