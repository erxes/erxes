import React, { useState } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';

import ChooseCategory from '../../ChooseCategory';

import PermitList from './PermitList';

const ADD_PERMIT = gql`
  mutation ForumPermissionGroupAddCategoryPermit(
    $_id: ID!
    $categoryIds: [ID!]!
    $permission: ForumPermission!
  ) {
    forumPermissionGroupAddCategoryPermit(
      _id: $_id
      categoryIds: $categoryIds
      permission: $permission
    )
  }
`;

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
      _id
      categoryId
      permissionGroupId
      permission
      category {
        _id
        name
      }
    }
  }
`;

type Props = {
  permissionGroupId: string;
};

type PermissionTypeProps = {
  permissionGroupId: string;
  permission: string;
  title: string;
};

const PermissionType: React.FC<PermissionTypeProps> = ({
  permissionGroupId,
  permission,
  title
}) => {
  const { data, loading, error } = useQuery(PERMITS, {
    variables: {
      permissionGroupId,
      permission
    }
  });

  const [showModal, setShowModal] = useState(false);

  const [mutGivePermission] = useMutation(ADD_PERMIT, {
    refetchQueries: ['ForumPermissionGroupCategoryPermits'],
    onError: e => {
      console.error(e);
      alert(e.message);
    },
    onCompleted: () => {
      alert('Permit granted');
    }
  });

  const onChooseComplete = async categoryIds => {
    setShowModal(false);
    if (!categoryIds?.length) return;
    await mutGivePermission({
      variables: {
        _id: permissionGroupId,
        categoryIds,
        permission
      }
    });
  };

  const alreadyChosenCategoryIds =
    data?.forumPermissionGroupCategoryPermits.map(p => p.categoryId) || [];

  return (
    <div>
      <h3>
        {title}{' '}
        <button type="button" onClick={() => setShowModal(true)}>
          Add
        </button>{' '}
      </h3>

      <ChooseCategory
        show={showModal}
        onChoose={onChooseComplete}
        excludeIds={alreadyChosenCategoryIds}
      />

      <PermitList permits={data?.forumPermissionGroupCategoryPermits || []} />
    </div>
  );
};

const Permission: React.FC<Props> = ({ permissionGroupId }) => {
  return (
    <div>
      <PermissionType
        title="Post writing permits for categories"
        permissionGroupId={permissionGroupId}
        permission="WRITE_POST"
      />
      <PermissionType
        title="Post reading permits for categories"
        permissionGroupId={permissionGroupId}
        permission="READ_POST"
      />
      <PermissionType
        title="Comment writing permits for categories"
        permissionGroupId={permissionGroupId}
        permission="WRITE_COMMENT"
      />
    </div>
  );
};

export default Permission;
