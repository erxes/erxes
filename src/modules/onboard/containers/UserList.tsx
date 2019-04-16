import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { queries as teamQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { UserList } from '../components';
import { mutations } from '../graphql';
import {
  UserRemoveMutationResponse,
  UserRemoveMutationVariables
} from '../types';

type Props = {
  userCount: number;
};

type FinalProps = { usersQuery: UsersQueryResponse } & Props &
  UserRemoveMutationResponse;

const UserListContainer = (props: ChildProps<FinalProps>) => {
  const { usersQuery, removeMutation } = props;

  const users = usersQuery.users || [];

  // remove action
  const remove = userId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: userId }
      })
        .then(() => {
          Alert.success('You successfully deleted a user');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    users,
    remove,
    loading: usersQuery.loading
  };

  return <UserList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, UsersQueryResponse, { perPage: number }>(
      gql(teamQueries.users),
      {
        name: 'usersQuery',
        options: ({ userCount }: Props) => ({
          variables: {
            perPage: userCount
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<UserRemoveMutationResponse, UserRemoveMutationVariables>(
      gql(mutations.usersRemove),
      {
        name: 'removeMutation',
        options: () => {
          return {
            refetchQueries: [
              { query: gql(teamQueries.users) },
              { query: gql(teamQueries.usersTotalCount) }
            ]
          };
        }
      }
    )
  )(UserListContainer)
);
