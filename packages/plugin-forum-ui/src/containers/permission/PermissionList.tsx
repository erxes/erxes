import * as compose from 'lodash.flowright';

import PermissionList from '../../components/permission/PermissionList';
import React from 'react';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import { useQuery } from '@apollo/client';

type FinalProps = {
  can?: (action: string) => boolean;
} & Props;

const List = (props: FinalProps) => {
  const { history, queryParams } = props;

  const { data } = useQuery(gql(queries.permits), {
    variables: {
      categoryId: queryParams.categoryId,
      permission: queryParams.permission,
      permissionGroupId: queryParams.permissionGroupId
    }
  });

  const permissionGroups = useQuery(gql(queries.permissionGroupsQuery), {
    fetchPolicy: 'network-only'
  });

  const categoryList = useQuery(gql(queries.categoryList), {
    fetchPolicy: 'network-only'
  });

  const datas = data?.forumPermissionGroupCategoryPermits || [];

  const permissions = datas.filter(
    r => r.permissionGroupId === queryParams.groupId
  );

  const updatedProps = {
    ...props,
    queryParams,
    history,
    permissions,
    refetchQueries: [
      {
        query: gql(queries.permits),
        variables: {
          categoryId: queryParams.categoryId,
          permission: queryParams.permission,
          permissionGroupId: queryParams.permissionGroupId
        }
      }
    ],
    categoryList: categoryList.data?.forumCategories || [],
    permissionGroups: permissionGroups.data?.forumPermissionGroups || []
  };

  return <PermissionList {...updatedProps} />;
};

type Props = {
  history: any;
  queryParams: any;
};

export default compose()(List);
