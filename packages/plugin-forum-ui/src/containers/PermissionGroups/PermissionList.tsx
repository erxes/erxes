import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import PermissionList from '../../components/permission/PermissionList';
import { queries } from '../../graphql';
import { useQuery } from 'react-apollo';

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
