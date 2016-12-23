/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { ApolloProvider } from 'react-apollo';
import thunkMiddleware from 'redux-thunk';
import client from '../apollo-client';
import erxesReducers from './reducers';
import { App } from './containers';
import { connect } from './erxes.js';
import './sass/style.scss';

const store = createStore(
	combineReducers({ ...erxesReducers, apollo: client.reducer() }),
	{}, // initial state
	compose(
		applyMiddleware(client.middleware()),
		applyMiddleware(thunkMiddleware),
		// If you are using the devToolsExtension, you can add it here also
		window.devToolsExtension ? window.devToolsExtension() : f => f
	)
);

// listen for widget toggle
window.addEventListener('message', (event) => {
  // connect to api using passed settings
  if (event.data.fromPublisher) {
    connect({ ...event.data.settings });
  }
});

ReactDOM.render(
	<ApolloProvider store={store} client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root')
);
