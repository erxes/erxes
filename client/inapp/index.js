/* eslint-disable react/jsx-filename-extension */

import gql from 'graphql-tag';
import client, { wsClient } from '../apollo-client';
import widgetConnect from '../widgetConnect';
import { connection } from './connection';
import reducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  connectMutation: (event) => {
    const settings = event.data.settings;

    // call connect mutation
    return client.mutate({
      mutation: gql`
        mutation connect($brandCode: String!, $email: String!, $name: String) {
          inAppConnect(brandCode: $brandCode, email: $email, name: $name) {
            integrationId,
            inAppData,
            uiOptions,
            customerId,
          }
        }`,

      variables: {
        brandCode: settings.brand_id,
        email: settings.email,
        name: settings.name,
      },
    });
  },

  connectCallback: (data) => {
    const inAppData = data.inAppConnect;

    // save connection info
    connection.data = inAppData;

    // send connected message to ws server and server will save given
    // data to connection. So when connection closed, we will use
    // customerId to mark customer as not active
    wsClient.sendMessage({ type: 'inAppConnected', value: inAppData });
  },

  AppContainer: App,

  reducers,
});
