import React from 'react';
import { Category } from '../components';
import { AppConsumer } from './AppContext';

const container = (props) => {
  return (
    <AppConsumer>
      {({ goToCategory }) =>
        <Category { ...props} onClick={goToCategory} />
      }
    </AppConsumer>
  );
}

export default container;
