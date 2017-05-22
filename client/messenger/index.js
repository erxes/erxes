/* eslint-disable react/jsx-filename-extension */

import gql from 'graphql-tag';
import client, { wsClient } from '../apollo-client';
import widgetConnect from '../widgetConnect';
import { connection, connect } from './connection';
import { EMAIL_LOCAL_STORAGE_KEY } from './constants';
import reducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  connectMutation: (event) => {
    const settings = event.data.settings;

    const clientPassedEmail = settings.email;

    // retrieve previously cached email from local storage
    const cachedEmail = localStorage.getItem(EMAIL_LOCAL_STORAGE_KEY);

    if (cachedEmail) {
      settings.email = cachedEmail;
    }

    // save user passed settings on connection. using this information in action
    connection.settings = settings;

    // if there is no email specified in user settings then
    // work as visitor mode
    if (!settings.email) {
      // call get messenger integration query
      return client.query({
        query: gql`
          query getIntegration($brandCode: String!) {
            getMessengerIntegration(brandCode: $brandCode) {
              uiOptions,
              messengerData,
            }
          }`,

        variables: { brandCode: settings.brand_id },
      });
    }

    // call connect mutation
    return connect({
      brandCode: settings.brand_id,
      email: settings.email,

      // if client passed email automatically then consider this as user
      isUser: Boolean(clientPassedEmail),

      name: settings.name,
    });
  },

  connectCallback: (data) => {
    const messengerData = data.messengerConnect || data.getMessengerIntegration;

    // save connection info
    connection.data = messengerData;

    // send connected message to ws server and server will save given
    // data to connection. So when connection closed, we will use
    // customerId to mark customer as not active
    wsClient.sendMessage({ type: 'messengerConnected', value: messengerData });
  },

  AppContainer: App,

  reducers,
});
