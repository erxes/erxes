import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

type Props = {
  users: any[];
  onRemove?: (userId: string) => any;
};

const PermissionGroupUsersList: React.FC<Props> = ({ users, onRemove }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>email</th>
            <th>username</th>
            <th>type</th>
            <th>First name</th>
            <th>Last name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.type}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>
                <button
                  type="button"
                  onClick={() => {
                    if (onRemove) onRemove(user._id);
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!users?.length && <div>No users</div>}
    </div>
  );
};

export default PermissionGroupUsersList;
