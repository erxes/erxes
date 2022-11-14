import React, { useState } from 'react';
import gql from 'graphql-tag';
import ChooseUsers from '../../ChooseUsers';
import { useMutation } from 'react-apollo';

type Props = {
  permissionGroupId: string;
  excludeIds: string[];
};

const MUT = gql`
  mutation ForumPermissionGroupAddUsers($id: ID!, $cpUserIds: [ID!]!) {
    forumPermissionGroupAddUsers(_id: $id, cpUserIds: $cpUserIds)
  }
`;

const PermissionGroupUsers: React.FC<Props> = ({
  permissionGroupId,
  excludeIds
}) => {
  const [showModal, setShowModal] = useState(false);

  const [addMut] = useMutation(MUT, {
    refetchQueries: ['ForumPermissionGroup'],
    onError: e => console.error(e)
  });

  const onChoose = async (ids: string[]) => {
    await addMut({
      variables: {
        id: permissionGroupId,
        cpUserIds: ids
      }
    });
    setShowModal(false);
  };

  return (
    <>
      <button type="button" onClick={() => setShowModal(true)}>
        Add users
      </button>
      <ChooseUsers
        show={showModal}
        excludeIds={excludeIds}
        onChoose={onChoose}
      />
    </>
  );
};

export default PermissionGroupUsers;
