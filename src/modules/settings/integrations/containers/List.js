import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from 'modules/common/components';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery, totalCountQuery, removeMutation } = props;

  if (totalCountQuery.loading || listQuery.loading) {
    return <Loading title="Integrations" />;
  }

  const totalCount = totalCountQuery.integrationsTotalCount;
  const integrations = listQuery.integrations;

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
    removeIntegration
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  listQuery: PropTypes.object,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(
    gql`
      query objects($page: Int, $perPage: Int, $kind: String) {
        integrations(page: $page, perPage: $perPage, kind: $kind) {
          _id
          brandId
          name
          kind
          brand {
            _id
            name
            code
          }
          formData
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
