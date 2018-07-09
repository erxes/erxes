import React from 'react';
import { Article } from '../components';
import { AppConsumer } from './AppContext';

const container = (props) => (
  <AppConsumer>
    {({ goToArticle }) =>
      <Article {...props} onClick={goToArticle} />
    }
  </AppConsumer>
);

export default container;
