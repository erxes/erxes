/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';
import client, { createStore } from '../apollo-client';
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
        mutation formConnect($brandCode: String!) {
          formConnect(brandCode: $brandCode) {
            integrationId,
            formId
          }
        }`,

      variables: {
        brandCode: settings.brand_id,
      },
    })

    .then(({ data }) => {
      console.log('connected ...'); // eslint-disable-line

      // save connection info
      connection.data = data.formConnect;

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
