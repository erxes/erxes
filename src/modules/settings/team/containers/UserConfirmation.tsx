import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';
import { UserConfirmation } from '../components';
import { mutations } from '../graphql';
import { ConfirmMutationResponse, ConfirmMutationVariables } from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = Props & IRouterProps & ConfirmMutationResponse;

class UserConfirmationContainer extends React.Component<FinalProps> {
  render() {
    const { usersConfirmInvitation, queryParams, history } = this.props;

    const confirmUser = ({
      password,
      passwordConfirmation,
      username,
      fullName
    }: {
      password: string;
      passwordConfirmation: string;
      username: string;
      fullName: string;
    }) => {
      usersConfirmInvitation({
        variables: {
          token: queryParams.token,
          password,
          passwordConfirmation,
          username,
          fullName
        }
      })
        .then(() => {
          Alert.success('You successfully verified');
          history.push('/');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      confirmUser
    };

    return <UserConfirmation {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConfirmMutationResponse, ConfirmMutationVariables>(
      gql(mutations.usersConfirmInvitation),
      {
        name: 'usersConfirmInvitation',
        options: {
          refetchQueries: ['users']
        }
      }
    )
  )(withRouter<FinalProps>(UserConfirmationContainer))
);
