import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PermissionList } from '../components';
import { mutations, queries } from '../graphql';
import {
  PermissionActionsQueryResponse,
  PermissionModulesQueryResponse,
  PermissionRemoveMutationResponse,
  PermissionsQueryResponse,
  PermissionTotalCountQueryResponse,
  UsersGroupsQueryResponse
} from '../types';

type FinalProps = {
  can: (action: string) => boolean;
} & Props;

const List = (props: FinalProps) => {
  const {
    history,
    queryParams,
    permissionsQuery,
    modulesQuery,
    actionsQuery,
    usersQuery,
    usersGroupsQuery,
    totalCountQuery,
    removeMutation
  } = props;

  // remove action
  const remove = (id: string) => {
    confirm().then(() => {
      removeMutation({
        variables: { ids: [id] }
      })
        .then(() => {
          Alert.success('You successfully deleted a permission.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const isLoading =
    permissionsQuery.loading ||
    modulesQuery.loading ||
    actionsQuery.loading ||
    usersQuery.loading ||
    usersGroupsQuery.loading ||
    totalCountQuery.loading;

  const updatedProps = {
    ...props,
    queryParams,
    history,
    remove,
    totalCount: totalCountQuery.permissionsTotalCount || 0,
    modules: modulesQuery.permissionModules || [],
    actions: actionsQuery.permissionActions || [],
    permissions: permissionsQuery.permissions || [],
    users: usersQuery.users || [],
    groups: usersGroupsQuery.usersGroups || [],
    isLoading,
    refetchQueries: commonOptions(queryParams)
  };

  return <PermissionList {...updatedProps} />;
};

type Props = {
  history: any;
  queryParams: any;
  permissionsQuery: PermissionsQueryResponse;
  modulesQuery: PermissionModulesQueryResponse;
  actionsQuery: PermissionActionsQueryResponse;
  usersQuery: UsersQueryResponse;
  usersGroupsQuery: UsersGroupsQueryResponse;
  totalCountQuery: PermissionTotalCountQueryResponse;
  removeMutation: (params: { variables: { ids: string[] } }) => Promise<any>;
};

const commonOptions = queryParams => {
  const variables = {
    module: queryParams.module,
    action: queryParams.action,
    userId: queryParams.userId,
    groupId: queryParams.groupId,
    ...generatePaginationParams(queryParams)
  };

  return [
    { query: gql(queries.permissions), variables },
    { query: gql(queries.totalCount), variables }
  ];
};

export default compose(
  graphql<Props, PermissionTotalCountQueryResponse>(gql(queries.totalCount), {
    name: 'totalCountQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: {
        module: queryParams.module,
        action: queryParams.action,
        userId: queryParams.userId,
        groupId: queryParams.groupId
      }
    })
  }),
  graphql<Props, PermissionsQueryResponse>(gql(queries.permissions), {
    name: 'permissionsQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: {
        module: queryParams.module,
        action: queryParams.action,
        userId: queryParams.userId,
        groupId: queryParams.groupId,
        ...generatePaginationParams(queryParams)
      }
    })
  }),
  graphql<Props, PermissionModulesQueryResponse>(gql(queries.modules), {
    name: 'modulesQuery'
  }),
  graphql<Props, PermissionActionsQueryResponse>(gql(queries.actions), {
    name: 'actionsQuery'
  }),
  graphql<Props, UsersQueryResponse>(gql(userQueries.users), {
    name: 'usersQuery'
  }),
  graphql<{}, UsersGroupsQueryResponse>(gql(queries.usersGroups), {
    name: 'usersGroupsQuery'
  }),

  // mutations
  graphql<Props, PermissionRemoveMutationResponse>(
    gql(mutations.permissionRemove),
    {
      name: 'removeMutation',
      options: ({ queryParams }) => ({
        refetchQueries: commonOptions(queryParams)
      })
    }
  )
)(List);
