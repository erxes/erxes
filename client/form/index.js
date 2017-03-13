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
        mutation formConnect($brandCode: String!) {
          formConnect(brandCode: $brandCode) {
            integrationId,
            formId
          }
        }`,

      variables: {
        brandCode: settings.brand_id,
      },
    });
  },

  connectCallback: (data) => {
    // save connection info
    connection.data = data.formConnect;
  },

  AppContainer: App,

  reducers,
});
