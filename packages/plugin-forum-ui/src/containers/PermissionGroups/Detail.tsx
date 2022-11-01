import React, { useState } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import {
  FORUM_POST_DETAIL,
  PERMISSION_GROUP_QUERY,
  POST_REFETCH_AFTER_EDIT
} from '../../graphql/queries';
import gql from 'graphql-tag';

import ChooseCategory from '../ChooseCategory';

import PermitList from './PermitList';

const MUT = gql`
  mutation ForumPermissionGroupDelete($_id: ID!) {
    forumPermissionGroupDelete(_id: $_id) {
      _id
    }
  }
`;

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

const PermissionGroupDetail: React.FC = () => {
  const history = useHistory();
  const { permissionGroupId } = useParams();

  const { data, loading, error } = useQuery(PERMISSION_GROUP_QUERY, {
    variables: { _id: permissionGroupId },
    fetchPolicy: 'network-only'
  });

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

  const [mutDelete] = useMutation(MUT, {
    variables: {
      _id: permissionGroupId
    },
    onCompleted: () => {
      history.push('/forums/permission-groups');
    },
    onError: e => {
      alert(JSON.stringify(e, null, 2));
    }
  });

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

  const onClickDelete = async () => {
    if (!confirm('Do you want to delete this permission group?')) return;
    await mutDelete();
  };

  if (loading) return null;

  if (error) return <pre>{error.message}</pre>;

  const { forumPermissionGroup } = data;

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
      <table>
        <tbody>
          <tr>
            <th>Name: </th>
            <td>{forumPermissionGroup.name}</td>
          </tr>
        </tbody>
      </table>
      <hr />

      <div>
        <button type="button" onClick={onClickDelete}>
          Delete
        </button>
      </div>

      <h3>Users: </h3>
      <ol>
        {(forumPermissionGroup.users || []).map(u => (
          <li>{u.email}</li>
        ))}
      </ol>

      <hr />

      <h3>
        Write permits{' '}
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
        Read permits{' '}
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

export default PermissionGroupDetail;
