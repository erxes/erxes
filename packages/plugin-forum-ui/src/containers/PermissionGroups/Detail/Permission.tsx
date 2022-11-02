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

const Permission: React.FC<Props> = ({ permissionGroupId }) => {
  const writePermitsQuery = useQuery(PERMITS, {
    variables: {
      permissionGroupId,
      permission: 'WRITE'
    }
  });

  const readPermitsQuery = useQuery(PERMITS, {
    variables: {
      permissionGroupId,
      permission: 'READ'
    }
  });

  const [showWriteChooseModal, setShowWriteChooseModal] = useState(false);
  const [showReadChooseModal, setShowReadChooseModal] = useState(false);

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

  const writePermitedCategoryIds =
    writePermitsQuery.data?.forumPermissionGroupCategoryPermits.map(
      p => p.categoryId
    ) || [];
  const readPermitedCategoryIds =
    readPermitsQuery.data?.forumPermissionGroupCategoryPermits.map(
      p => p.categoryId
    ) || [];

  const chooseWritePermitComplete = async categoryIds => {
    setShowWriteChooseModal(false);
    if (!categoryIds?.length) return;
    await mutGivePermission({
      variables: {
        _id: permissionGroupId,
        categoryIds,
        permission: 'WRITE'
      }
    });
  };

  const chooseReadPermitComplete = async categoryIds => {
    setShowReadChooseModal(false);
    if (!categoryIds?.length) return;
    await mutGivePermission({
      variables: {
        _id: permissionGroupId,
        categoryIds,
        permission: 'READ'
      }
    });
  };

  return (
    <div>
      <h3>
        Write permits for categories{' '}
        <button type="button" onClick={() => setShowWriteChooseModal(true)}>
          Add
        </button>{' '}
      </h3>

      {
        <ChooseCategory
          show={showWriteChooseModal}
          onChoose={chooseWritePermitComplete}
          excludeIds={writePermitedCategoryIds}
        />
      }

      <PermitList
        permits={
          writePermitsQuery.data?.forumPermissionGroupCategoryPermits || []
        }
      />

      <hr />
      <h3>
        Read permits for categories{' '}
        <button type="button" onClick={() => setShowReadChooseModal(true)}>
          Add
        </button>{' '}
      </h3>

      {
        <ChooseCategory
          show={showReadChooseModal}
          onChoose={chooseReadPermitComplete}
          excludeIds={readPermitedCategoryIds}
        />
      }

      <PermitList
        permits={
          readPermitsQuery.data?.forumPermissionGroupCategoryPermits || []
        }
      />
      <hr />
    </div>
  );
};

export default Permission;
