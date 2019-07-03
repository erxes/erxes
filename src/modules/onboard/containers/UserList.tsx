import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { queries as teamQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { UserList } from '../components';
import { mutations } from '../graphql';
import {
  UserStatusChangeMutationResponse,
  UserStatusChangeMutationVariables
} from '../types';

type Props = {
  userCount: number;
};

type FinalProps = { usersQuery: UsersQueryResponse } & Props &
  UserStatusChangeMutationResponse;

const UserListContainer = (props: ChildProps<FinalProps>) => {
  const { usersQuery, statusChangedMutation } = props;

  const users = usersQuery.users || [];

  // deactivate action
  const changeStatus = userId => {
    confirm().then(() => {
      statusChangedMutation({
        variables: { _id: userId }
      })
        .then(() => {
          Alert.success('You successfully deactivated a user');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    users,
    deactivate: changeStatus,
    loading: usersQuery.loading
  };

  return <UserList {...updatedProps} />;
};

const commonOption = (userCount: number) => {
  return {
    perPage: userCount,
    isActive: true
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, UsersQueryResponse, { perPage: number }>(
      gql(teamQueries.users),
      {
        name: 'usersQuery',
        options: ({ userCount }: Props) => ({
          variables: commonOption(userCount),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<
      Props & UserStatusChangeMutationResponse,
      UserStatusChangeMutationVariables
    >(gql(mutations.usersStatusChange), {
      name: 'statusChangedMutation',
      options: ({ userCount }: Props) => ({
        refetchQueries: [
          {
            query: gql(teamQueries.users),
            variables: commonOption(userCount)
          },
          {
            query: gql(teamQueries.usersTotalCount),
            variables: commonOption(userCount)
          }
        ]
      })
    })
  )(UserListContainer)
);
