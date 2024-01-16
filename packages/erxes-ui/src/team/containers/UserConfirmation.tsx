import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { ConfirmMutationResponse, ConfirmMutationVariables } from '../types';

// import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import UserConfirmation from '../components/UserConfirmation';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';

type Props = {
  queryParams: any;
  currentUser?: IUser;
};

type FinalProps = Props & IRouterProps & ConfirmMutationResponse;

class UserConfirmationContainer extends React.Component<FinalProps> {
  render() {
    const { usersConfirmInvitation, queryParams, history, currentUser } =
      this.props;

    const confirmUser = ({
      password,
      passwordConfirmation,
      username,
      fullName,
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
          fullName,
        },
      })
        .then(() => {
          Alert.success('You successfully verified');
          history.push('/');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      confirmUser,
      currentUser,
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
          refetchQueries: ['users'],
        },
      },
    ),
  )(UserConfirmationContainer),
);
