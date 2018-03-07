import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { PermissionList } from '../components';
import { queries, mutations } from '../graphql';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { Alert, confirm } from 'modules/common/utils';

const PermissionListContainer = props => {
  const {
    permissionsQuery,
    modulesQuery,
    actionsQuery,
    usersQuery,
    totalCountQuery,
    queryParams,
    history,
    removeMutation,
    addMutation
  } = props;

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeMutation({
        variables: { ids: [_id] }
      })
        .then(() => {
          // update queries
          permissionsQuery.refetch();
          totalCountQuery.refetch();

          Alert.success('Congrats', 'Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create action
  const save = (doc, callback) => {
    addMutation({
      variables: doc
    })
      .then(() => {
        // update queries
        permissionsQuery.refetch();
        totalCountQuery.refetch();

        Alert.success('Congrats');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const isLoading =
    permissionsQuery.loading ||
    modulesQuery.loading ||
    actionsQuery.loading ||
    usersQuery.loading ||
    totalCountQuery.loading;

  const updatedProps = {
    queryParams,
    history,
    save,
    remove,
    totalCount: totalCountQuery.permissionsTotalCount || 0,
    modules: modulesQuery.permissionModules || [],
    actions: actionsQuery.permissionActions || [],
    permissions: permissionsQuery.permissions || [],
    users: usersQuery.users || [],
    isLoading
  };

  return <PermissionList {...updatedProps} />;
};

PermissionListContainer.propTypes = {
  queryParams: PropTypes.object,
  history: PropTypes.object,
  permissionsQuery: PropTypes.object,
  modulesQuery: PropTypes.object,
  actionsQuery: PropTypes.object,
  usersQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
  addMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

export default withRouter(
  compose(
    graphql(gql(queries.totalCount), {
      name: 'totalCountQuery',
      options: ({ queryParams }) => ({
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        variables: {
          module: queryParams.module,
          action: queryParams.action,
          userId: queryParams.userId
        }
      })
    }),
    graphql(gql(queries.permissions), {
      name: 'permissionsQuery',
      options: ({ queryParams }) => ({
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        variables: {
          module: queryParams.module,
          action: queryParams.action,
          userId: queryParams.userId,
          page: queryParams.page || 1,
          perPage: queryParams.perPage || 20
        }
      })
    }),
    graphql(gql(queries.modules), { name: 'modulesQuery' }),
    graphql(gql(queries.actions), { name: 'actionsQuery' }),
    graphql(gql(userQueries.users), { name: 'usersQuery' }),

    // mutations
    graphql(gql(mutations.permissionAdd), {
      name: 'addMutation'
    }),
    graphql(gql(mutations.permissionRemove), {
      name: 'removeMutation'
    })
  )(PermissionListContainer)
);
