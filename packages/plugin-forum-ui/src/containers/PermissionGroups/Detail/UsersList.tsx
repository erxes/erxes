import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

type Props = {
  users: any[];
};

const PermissionGroupUsersList: React.FC<Props> = ({ users }) => {
  return (
    <ul>
      {!users?.length && <div>No users</div>}
      {users.map(user => (
        <li key={user._id}>{user.email}</li>
      ))}
    </ul>
  );
};

export default PermissionGroupUsersList;
