import client from 'apolloClient';
import gql from 'graphql-tag';
import { ButtonMutate, Icon } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __, withProps } from 'modules/common/utils';
import { queries as permissionQueries } from 'modules/settings/permissions/graphql';
import { queries as teamQueries } from 'modules/settings/team/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUserGroup } from '../../settings/permissions/types';
import { UserAdd } from '../components';
import { OnboardConsumer } from '../containers/OnboardContext';
import { mutations } from '../graphql';
import { UsersCountQueryResponse } from '../types';

type Props = { changeStep: (inscrease: boolean) => void };

type FinalProps = { usersCountQuery: UsersCountQueryResponse } & Props;

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
    const { usersCountQuery } = this.props;

    const usersTotalCount = usersCountQuery.usersTotalCount || 0;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.usersInvite}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          disabled={!values}
          type="submit"
          successMessage={`You successfully invited a ${name}`}
        >
          {__('Next')} <Icon icon="rightarrow-2" />
        </ButtonMutate>
      );
    };

    const updatedProps = {
      ...this.props,
      usersTotalCount,
      usersGroups: this.state.usersGroups,
      renderButton
    };

    return <UserAdd {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    { query: gql(teamQueries.users) },
    { query: gql(teamQueries.usersTotalCount) }
  ];
};

const WithQuery = withProps<Props>(
  compose(
    graphql<Props, UsersCountQueryResponse, {}>(
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
