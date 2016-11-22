/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import erxesApp from './reducers';
import { App } from './containers';


export const store = createStore(erxesApp, applyMiddleware(thunkMiddleware));

export default (root) => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  );
};
