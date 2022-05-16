import Welcome from '../components/Welcome';
import { IUser } from 'modules/auth/types';
import React from 'react';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { withProps } from 'modules/common/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { queries as generalQueries } from '@erxes/ui-settings/src/general/graphql';

type Props = {
  currentUser: IUser;
};

class WelcomeContainer extends React.Component<Props> {
  render() {
    const { currentUser } = this.props;

    return <Welcome currentUser={currentUser} />;
  }
}

const WithUser = withCurrentUser(WelcomeContainer);

export default withProps(
  compose(
    graphql(gql(generalQueries.configsGetEnv), {
      name: 'getEnvQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(WithUser)
);
