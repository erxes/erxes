import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery, totalCountQuery, removeMutation, queryParams } = props;

  if (totalCountQuery.loading) {
    return <Spinner />;
  }

  let totalCount = totalCountQuery.integrationsTotalCount.total;

  if (queryParams.kind) {
    totalCount =
      totalCountQuery.integrationsTotalCount.byKind[queryParams.kind];
  }

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
  loading: PropTypes.bool,
  queryParams: PropTypes.object
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
          tagIds
          tags {
            _id
            colorCode
            name
          }
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
      query totalIntegrationsCount {
        integrationsTotalCount {
          total
          byKind
        }
      }
    `,
    {
      name: 'totalCountQuery'
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
