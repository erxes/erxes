import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

const REMOVE = gql`
  mutation ForumPermissionGroupRemoveCategoryPermit(
    $id: ID!
    $categoryIds: [ID!]!
    $permission: ForumPermission!
  ) {
    forumPermissionGroupRemoveCategoryPermit(
      _id: $id
      categoryIds: $categoryIds
      permission: $permission
    )
  }
`;

type Props = {
  permits: any[];
};

const PermitList: React.FC<Props> = ({ permits }) => {
  const [mutRemove] = useMutation(REMOVE, {
    refetchQueries: ['ForumPermissionGroupCategoryPermits'],
    onError: e => {
      console.error(e);
    }
  });

  return (
    <div>
      <ul>
        {permits.map(p => {
          return (
            <li key={p._id}>
              {p.category.name}{' '}
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Are you sure you want to remove this permit?'))
                    return;
                  await mutRemove({
                    variables: {
                      id: p.permissionGroupId,
                      categoryIds: [p.categoryId],
                      permission: p.permission
                    }
                  });
                }}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PermitList;
