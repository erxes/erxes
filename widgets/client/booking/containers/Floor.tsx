import * as React from 'react';
import { Floor } from '../components';
import { AppConsumer } from './AppContext';

class FloorContainer extends React.Component {
  render() {
    return <Floor />;
  }
}

const WithContext = () => (
  <AppConsumer>{({}) => <FloorContainer />}</AppConsumer>
);

export default WithContext;
