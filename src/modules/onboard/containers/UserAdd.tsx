import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { UserMutationVariables } from 'modules/settings/team/types';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { UserAdd } from '../components';
import { mutations, queries } from '../graphql';
import { UsersAddMutationResponse, UsersCountQueryResponse } from '../types';

type Props = { queryParams: any };

type FinalProps = { usersCountQuery: UsersCountQueryResponse } & Props &
  UsersAddMutationResponse;

const UserAddContainer = (props: ChildProps<FinalProps>) => {
  const { usersCountQuery, addMutation } = props;

  const usersTotalCount = usersCountQuery.usersTotalCount || 0;

  // add action
  const save = ({ doc }, callback: () => void) => {
    addMutation({ variables: doc })
      .then(() => {
        Alert.success('Successfully added new user.');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    usersTotalCount,
    save
  };

  return <UserAdd {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, UsersAddMutationResponse, UserMutationVariables>(
      gql(mutations.usersAdd),
      {
        name: 'addMutation',
        options: ({ queryParams }) => {
          return {
            refetchQueries: [
              {
                query: gql(queries.users),
                variables: { perPage: queryParams.limit || 20 }
              },
              { query: gql(queries.userTotalCount) }
            ]
          };
        }
      }
    ),
    graphql<Props, UsersAddMutationResponse, {}>(gql(queries.userTotalCount), {
      name: 'usersCountQuery'
    })
  )(UserAddContainer)
);
