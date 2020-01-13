import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import PermissionList from '../components/PermissionList';
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
    allowed: queryParams.allowed === 'notAllowed' ? false : true,
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
        groupId: queryParams.groupId,
        allowed: queryParams.allowed === 'notAllowed' ? false : true
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
        allowed: queryParams.allowed === 'notAllowed' ? false : true,
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
