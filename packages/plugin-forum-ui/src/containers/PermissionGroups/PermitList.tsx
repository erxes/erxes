import React from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import {
  FORUM_POST_DETAIL,
  PERMISSION_GROUP_QUERY,
  POST_REFETCH_AFTER_EDIT
} from '../../graphql/queries';
import gql from 'graphql-tag';

const PERMITS = gql`
  query ForumPermissionGroupCategoryPermits(
    $permissionGroupId: [ID!]
    $permission: [ForumPermission!]
    $categoryId: [ID!]
  ) {
    forumPermissionGroupCategoryPermits(
      permissionGroupId: $permissionGroupId
      permission: $permission
      categoryId: $categoryId
    ) {
      category {
        _id
        name
      }
    }
  }
`;

// const DELETE = gql``;

type Props = {
  permissionGroupId: string;
  permission: string;
};

const PermitList: React.FC<Props> = ({ permissionGroupId, permission }) => {
  const variables: any = {};

  if (permissionGroupId) variables.permissionGroupId = [permissionGroupId];

  if (permission) variables.permission = [permission];

  const { data, loading, error } = useQuery(PERMITS, {
    variables
  });

  // const [mutDelete] = useMutation(DELETE, {
  //   onError: e => {
  //     alert(JSON.stringify(e, null, 2));
  //   }
  // });

  // const onClickDelete = async () => {
  //   if (!confirm('Do you want to remove this permit?')) return;
  //   await mutDelete({
  //     variables: {}
  //   });
  // };

  if (loading) return null;

  if (error) return <pre>{error.message}</pre>;

  const forumPermissionGroupCategoryPermits =
    data.forumPermissionGroupCategoryPermits || [];

  return (
    <div>
      <ul>
        {forumPermissionGroupCategoryPermits.map(p => {
          return (
            <li>
              {p.category.name}

              <button type="button">Remove</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PermitList;
