import * as React from 'react';
import Intro from '../components/Intro';
import { AppConsumer } from './AppContext';

function IntroContainer() {
  return (
    <AppConsumer>
      {() => {
        return <Intro />;
      }}
    </AppConsumer>
  );
}

export default IntroContainer;
