import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Routes from './routes';
import store from './store';
import './modules/common/styles/global-styles.js';

const target = document.querySelector('#root')

render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  target
);
