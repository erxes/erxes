import { AppConsumer } from 'appContext';
import React from 'react';
import Robot from '../components/Robot';

export default class RobotContainer extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ currentUser }) =>
          currentUser && <Robot currentUser={currentUser} />
        }
      </AppConsumer>
    );
  }
}
