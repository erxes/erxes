/* eslint-disable react/jsx-filename-extension */

import gql from 'graphql-tag';
import client from '../apollo-client';
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
        mutation chatConnect($brandCode: String!) {
          chatConnect(brandCode: $brandCode)
        }`,

      variables: {
        brandCode: settings.brand_id,
      },
    });
  },

  connectCallback: (data) => {
    const integrationId = data.chatConnect;

    // save connection info
    connection.data = { integrationId };
  },

  AppContainer: App,

  reducers,
});
