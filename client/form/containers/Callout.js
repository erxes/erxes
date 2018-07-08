import React from 'react';
import { Callout } from '../components';
import { AppConsumer } from './AppContext';

const container = (props) => (
  <AppConsumer>
    {({ showForm }) =>
      <Callout {...props} onSubmit={showForm} />
    }
  </AppConsumer>
);

export default container;
