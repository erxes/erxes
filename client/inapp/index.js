/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { ApolloProvider } from 'react-apollo';
import thunkMiddleware from 'redux-thunk';
import gql from 'graphql-tag';
import client from '../apollo-client';
import { connection } from './connection.js';
import erxesReducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

// create store
// combine local reducers with apollo reducers
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
    const settings = event.data.settings;

    // call connect mutation
    client.mutate({
      mutation: gql`
        mutation connect($brandCode: String!, $email: String!) {
          connect(brandCode: $brandCode, email: $email) {
            integrationId,
            customerId,
          }
        }`,

      variables: {
        brandCode: settings.brand_id,
        email: settings.email,
      },
    })

    .then(({ data }) => {
      if (data.connect.integrationId && data.connect.customerId) {
        // save connection info
        connection.data = data.connect;

        // render root react component
        ReactDOM.render(
          <ApolloProvider store={store} client={client}>
            <App />
          </ApolloProvider>,
          document.getElementById('root')
        );
      }
    });
  }
});
