import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';
import { Form } from '../components';

const ListContainer = props => {
  const { integrationsQuery } = props;

  const integrations = integrationsQuery.integrations || [];

  const updatedProps = {
    ...this.props,
    integrations,
    loading: integrationsQuery.loading
  };

  return <Form {...updatedProps} />;
};

ListContainer.propTypes = {
  integrationsQuery: PropTypes.object,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({ queryParams }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage || 20,
          kind: 'form'
        },
        fetchPolicy: 'network-only'
      };
    }
  })
)(ListContainer);
