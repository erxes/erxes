/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import thunkMiddleware from 'redux-thunk';
import erxesReducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

const client = new ApolloClient({});

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

ReactDOM.render(
	<ApolloProvider store={store} client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root')
);
