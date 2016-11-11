import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import erxresApp from './reducers';
import App from './components/App';


export const store = createStore(
  erxresApp,
  applyMiddleware(
    thunkMiddleware // lets us dispatch() functions
  )
);

export default function (div) {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    div
  );
}
