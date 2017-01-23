/* global window, document */
/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';
import client, { wsClient, createStore } from '../apollo-client';
import { connection } from './connection';
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
        mutation connect($brandCode: String!, $email: String!) {
          inAppConnect(brandCode: $brandCode, email: $email) {
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
      const inAppData = data.inAppConnect;

      if (!inAppData) {
        throw new Error('Integration not found');
      }

      // save connection info
      connection.data = inAppData;

      // send connected message to ws server and server will save given
      // data to connection. So when connection closed, we will use
      // customerId to mark customer as not active
      wsClient.sendMessage({ type: 'inAppConnected', value: inAppData });

      // render root react component
      ReactDOM.render(
        <ApolloProvider store={createStore(erxesReducers)} client={client}>
          <App />
        </ApolloProvider>,
        document.getElementById('root'),
      );
    });
  }
});
