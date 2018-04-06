import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { List } from '../components';

const ListContainer = props => {
  const { integrationsQuery, integrationsCountQuery, removeMutation } = props;

  const integrationsCount = integrationsCountQuery.integrationsTotalCount || 0;
  const integrations = integrationsQuery.integrations || [];

  const remove = (_id, callback) => {
    removeMutation({
      variables: { _id }
    }).then(() => {
      // refresh queries
      integrationsQuery.refetch();
      integrationsCountQuery.refetch();

      callback();
    });
  };

  const updatedProps = {
    ...this.props,
    integrations,
    integrationsCount,
    remove,
    loading: integrationsQuery.loading
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  integrationsCountQuery: PropTypes.object,
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
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery',
    options: () => {
      return {
        variables: { kind: 'form' },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql(gql(mutations.integrationRemove), {
    name: 'removeMutation'
  })
)(ListContainer);
