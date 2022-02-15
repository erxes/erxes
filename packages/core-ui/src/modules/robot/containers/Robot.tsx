import { AppConsumer } from 'appContext';
import React from 'react';
import Robot from '../components/Robot';

export default class RobotContainer extends React.Component<{
  collapsed: boolean;
}> {
  render() {
    return (
      <AppConsumer>
        {({ currentUser }) =>
          currentUser && <Robot {...this.props} currentUser={currentUser} />
        }
      </AppConsumer>
    );
  }
}
