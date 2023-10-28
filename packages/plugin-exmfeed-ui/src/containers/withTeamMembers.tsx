import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { queries } from '../graphql';

import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

const withTeamMembers = Component => {
  const Container = props => {
    const allUsersQuery = useQuery(gql(queries.allUsers));

    const { currentUser } = props;

    const users =
      allUsersQuery && !allUsersQuery.loading
        ? allUsersQuery.data.allUsers.filter(u => u._id !== currentUser._id)
        : [];

    return <Component users={users} {...props} />;
  };

  return withCurrentUser(Container);
};

export default withTeamMembers;
