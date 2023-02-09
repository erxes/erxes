import React, { useState, FC } from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

const LOGOUT = gql`
  mutation Mutation {
    clientPortalLogout
  }
`;

const LOGIN = gql`
  mutation ClientPortalLogin(
    $clientPortalId: String!
    $login: String!
    $password: String!
  ) {
    clientPortalLogin(
      clientPortalId: $clientPortalId
      login: $login
      password: $password
    )
  }
`;

const CpLogin: FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const [mutLogin] = useMutation(LOGIN, {
    refetchQueries: ['ClientPortalCurrentUser']
  });
  const [mutLogout] = useMutation(LOGOUT, {
    refetchQueries: ['ClientPortalCurrentUser']
  });

  const onSubmit = async e => {
    e.preventDefault();
    await mutLogin({
      variables: {
        clientPortalId: 'FzYPTfW53aCmJ3pHQ',
        login,
        password
      }
    });
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="login"
          onChange={e => setLogin(e.target.value)}
        />
        <input
          type="password"
          name="password"
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <button
          type="button"
          onClick={async () => {
            mutLogout();
          }}
        >
          Logout
        </button>
      </form>
    </div>
  );
};

export default CpLogin;
