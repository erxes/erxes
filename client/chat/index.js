/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';
import client, { createStore } from '../apollo-client';
import { connection } from './connection.js';
import erxesReducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

// listen for widget toggle
window.addEventListener('message', (event) => {
  // connect to api using passed settings
  if (event.data.fromPublisher) {
    const settings = event.data.settings;

    // call connect mutation
    client.mutate({
      mutation: gql`
        mutation chatConnect($brandCode: String!) {
          chatConnect(brandCode: $brandCode)
        }`,

      variables: {
        brandCode: settings.brand_id,
      },
    })

    .then(({ data }) => {
      const integrationId = data.chatConnect;

      // save connection info
      connection.data = { integrationId };

      // render root react component
      ReactDOM.render(
        <ApolloProvider store={createStore(erxesReducers)} client={client}>
          <App />
        </ApolloProvider>,
        document.getElementById('root'),
      );
    })

    .catch((error) => {
      console.log(error); // eslint-disable-line
      console.log('Integration not found'); // eslint-disable-line
    });
  }
});
