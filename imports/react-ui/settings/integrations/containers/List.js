import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { pagination } from '/imports/react-ui/common';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery, totalCountQuery, queryParams } = props;

  if (totalCountQuery.loading || listQuery.loading) {
    return null;
  }

  const totalCount = totalCountQuery.totalIntegrationsCount;
  const integrations = listQuery.integrations;

  const { loadMore, hasMore } = pagination(queryParams, totalCount);

  const removeIntegration = (id, callback) => {
    Meteor.call('integrations.remove', id, callback);
  };

  const updatedProps = {
    ...this.props,
    integrations,
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
          name
          kind
          brand {
            name
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
        };
      },
    },
  ),
  graphql(
    gql`
      query totalIntegrationsCount {
        totalIntegrationsCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),
)(ListContainer);
