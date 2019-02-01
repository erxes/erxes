import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { UserAdd } from '../components';
import { OnboardConsumer } from '../containers/OnboardContext';
import { mutations, queries } from '../graphql';
import { UsersAddMutationResponse, UsersCountQueryResponse } from '../types';

type Props = { changeStep: (inscrease: boolean) => void };

type FinalProps = { usersCountQuery: UsersCountQueryResponse } & Props &
  UsersAddMutationResponse;

const UserAddContainer = (props: ChildProps<FinalProps>) => {
  const { usersCountQuery, addMutation } = props;

  const usersTotalCount = usersCountQuery.usersTotalCount || 0;

  // add action
  const save = ({ doc }, callback: () => void) => {
    addMutation({ variables: doc })
      .then(() => {
        Alert.success('Successfully invited new user.');

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

const WithQuery = withProps<Props>(
  compose(
    graphql(gql(mutations.usersInvite), {
      name: 'addMutation',
      options: () => {
        return {
          refetchQueries: [
            { query: gql(queries.users) },
            { query: gql(queries.userTotalCount) }
          ]
        };
      }
    }),
    graphql<Props, UsersAddMutationResponse, {}>(gql(queries.userTotalCount), {
      name: 'usersCountQuery'
    })
  )(UserAddContainer)
);

export default () => (
  <OnboardConsumer>
    {({ changeStep }) => <WithQuery changeStep={changeStep} />}
  </OnboardConsumer>
);
