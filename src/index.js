import React from 'react';
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import Routes from './layout/routes'
import store, { history } from './store'
import registerServiceWorker from './registerServiceWorker';
import './styles/global-styles.js';

const target = document.querySelector('#root')

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes />
    </ConnectedRouter>
  </Provider>,
  target
);
registerServiceWorker();
