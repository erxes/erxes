import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import Welcome from '../components/Welcome';

type Props = {
  currentUser: IUser;
};

class WelcomeContainer extends React.Component<Props> {
  render() {
    const { currentUser } = this.props;

    return <Welcome currentUser={currentUser} />;
  }
}

export default withCurrentUser(WelcomeContainer);
