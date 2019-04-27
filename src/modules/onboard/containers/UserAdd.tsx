import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { queries as permissionQueries } from 'modules/settings/permissions/graphql';
import { queries as teamQueries } from 'modules/settings/team/graphql';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { IUserGroup } from '../../settings/permissions/types';
import { UserAdd } from '../components';
import { OnboardConsumer } from '../containers/OnboardContext';
import { mutations } from '../graphql';
import { UsersAddMutationResponse, UsersCountQueryResponse } from '../types';

type Props = { changeStep: (inscrease: boolean) => void };

type FinalProps = { usersCountQuery: UsersCountQueryResponse } & Props &
  UsersAddMutationResponse;

class UserAddContainer extends React.Component<
  FinalProps,
  { usersGroups: IUserGroup[] }
> {
  constructor(props) {
    super(props);

    this.state = { usersGroups: [] };
  }

  componentDidMount() {
    client
      .query({
        query: gql(permissionQueries.usersGroups)
      })
      .then(({ data: { usersGroups } }: any) => {
        this.setState({ usersGroups });
      });
  }

  render() {
    const { usersCountQuery, addMutation } = this.props;

    const usersTotalCount = usersCountQuery.usersTotalCount || 0;

    // add action
    const save = ({ doc }, callback: () => void) => {
      addMutation({ variables: doc })
        .then(() => {
          Alert.success('You successfully invited a team member');
          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      usersTotalCount,
      usersGroups: this.state.usersGroups,
      save
    };

    return <UserAdd {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql(gql(mutations.usersInvite), {
      name: 'addMutation',
      options: () => {
        return {
          refetchQueries: [
            { query: gql(teamQueries.users) },
            { query: gql(teamQueries.usersTotalCount) }
          ]
        };
      }
    }),
    graphql<Props, UsersAddMutationResponse, {}>(
      gql(teamQueries.usersTotalCount),
      {
        name: 'usersCountQuery',
        options: () => ({
          variables: { isActive: true }
        })
      }
    )
  )(UserAddContainer)
);

export default () => (
  <OnboardConsumer>
    {({ changeStep }) => <WithQuery changeStep={changeStep} />}
  </OnboardConsumer>
);
