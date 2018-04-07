import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery, totalCountQuery, removeMutation } = props;

  const totalCount = totalCountQuery.integrationsTotalCount || 0;
  const integrations = listQuery.integrations || [];

  const removeIntegration = (_id, callback) => {
    removeMutation({
      variables: { _id }
    }).then(() => {
      // refresh queries
      listQuery.refetch();
      totalCountQuery.refetch();

      callback();
    });
  };

  const updatedProps = {
    ...this.props,
    integrations,
    refetch: listQuery.refetch,
    totalCount,
    removeIntegration,
    loading: listQuery.loading
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  listQuery: PropTypes.object,
  removeMutation: PropTypes.func,
  loading: PropTypes.bool
};

export default compose(
  graphql(
    gql`
      query objects($page: Int, $perPage: Int, $kind: String) {
        integrations(page: $page, perPage: $perPage, kind: $kind) {
          _id
          brandId
          languageCode
          name
          kind
          brand {
            _id
            name
            code
          }
          formData
          twitterData
          formId
          form {
            _id
            title
            code
          }
        }
      }
    `,
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            page: queryParams.page,
            perPage: queryParams.perPage || 20,
            kind: queryParams.kind
          },
          fetchPolicy: 'network-only'
        };
      }
    }
  ),
  graphql(
    gql`
      query totalIntegrationsCount($kind: String) {
        integrationsTotalCount(kind: $kind)
      }
    `,
    {
      name: 'totalCountQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            kind: queryParams.kind
          },
          fetchPolicy: 'network-only'
        };
      }
    }
  ),
  graphql(
    gql`
      mutation integrationsRemove($_id: String!) {
        integrationsRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  )
)(ListContainer);
