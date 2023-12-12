import * as compose from 'lodash.flowright';

import React, { useEffect, useRef, useState } from 'react';

import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries as userQuery } from '@erxes/ui/src/team/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import UserFilter from '../../components/filters/UserFilter';
import uniqBy from 'lodash/unionBy';

type Props = {
  usersQuery?: UsersQueryResponse;
  usersTotalCountQuery: any;
  queryParams: any;
  history: any;
};

function UserFilterContainer(props: Props) {
  const { usersQuery, usersTotalCountQuery, queryParams } = props;

  const defaultUsers = usersQuery ? usersQuery.users || [] : [];
  const totalCount = usersTotalCountQuery
    ? usersTotalCountQuery.usersTotalCount || 0
    : 0;

  const [users, setUsers] = useState(defaultUsers);
  const prevProp = useRef(usersQuery);

  useEffect(() => {
    const prevUsersQuery = prevProp.current;

    if (
      usersQuery &&
      prevUsersQuery &&
      usersQuery.users &&
      usersQuery.users !== prevUsersQuery.users
    ) {
      if (!queryParams.searchUser || !queryParams.searchUser.length) {
        setUsers(uniqBy([...users, ...usersQuery.users], '_id'));
      } else {
        setUsers(usersQuery.users);
      }
    }

    prevProp.current = usersQuery;
  }, [usersQuery, queryParams.searchUser]);

  const loadMore = () => {
    if (usersQuery) {
      usersQuery.refetch({
        perPage: 10,
        page: Math.floor(users.length / 10) + 1
      });
    }
  };

  const updatedProps = {
    ...props,
    users,
    loading: usersQuery?.loading || usersTotalCountQuery.loading,
    loadMore,
    all: totalCount
  };

  return <UserFilter {...updatedProps} />;
}

type WrapperProps = {
  queryParams?: any;
  history?: any;
  abortController?: any;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, UsersQueryResponse, {}>(gql(userQuery.users), {
      name: 'usersQuery',
      options: ({ abortController, queryParams }) => ({
        variables: {
          perPage: 10,
          page: 1,
          searchValue: queryParams.searchUser
        },
        context: {
          fetchOptions: { signal: abortController && abortController.signal }
        }
      })
    }),
    graphql<WrapperProps, UsersQueryResponse, {}>(
      gql(userQuery.usersTotalCount),
      {
        name: 'usersTotalCountQuery',
        options: ({ abortController }) => ({
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    )
  )(UserFilterContainer)
);
