import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { pagination, Loading } from '/imports/react-ui/common';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery, totalCountQuery, queryParams } = props;

  if (totalCountQuery.loading || listQuery.loading) {
    return <Loading title="Integrations" />;
  }

  const totalCount = totalCountQuery.integrationsTotalCount;
  const integrations = listQuery.integrations;

  const { loadMore, hasMore } = pagination(queryParams, totalCount);

  const removeIntegration = (id, callback) => {
    Meteor.call('integrations.remove', id, (...params) => {
      // refresh queries
      listQuery.refetch();
      totalCountQuery.refetch();

      callback(...params);
    });
  };

  const updatedProps = {
    ...this.props,
    integrations,
    refetch: listQuery.refetch,
    loadMore,
    hasMore,
    removeIntegration,
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  listQuery: PropTypes.object,
  queryParams: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query objects($limit: Int!, $kind: String) {
        integrations(limit: $limit, kind: $kind) {
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
            limit: queryParams.limit || 20,
            kind: queryParams.kind,
          },
          fetchPolicy: 'network-only',
        };
      },
    },
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
            kind: queryParams.kind,
          },
          fetchPolicy: 'network-only',
        };
      },
    },
  ),
)(ListContainer);
