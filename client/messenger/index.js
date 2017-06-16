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
    const setting = event.data.setting;

    const clientPassedEmail = setting.email;

    // retrieve previously cached email from local storage
    const cachedEmail = localStorage.getItem(EMAIL_LOCAL_STORAGE_KEY);

    if (cachedEmail) {
      setting.email = cachedEmail;
    }

    // save user passed setting on connection. using this information in action
    connection.setting = setting;

    // if there is no email specified in user setting then
    // work as visitor mode
    if (!setting.email) {
      // call get messenger integration query
      return client.query({
        query: gql`
          query getIntegration($brandCode: String!) {
            getMessengerIntegration(brandCode: $brandCode) {
              uiOptions,
              messengerData,
            }
          }`,

        variables: { brandCode: setting.brand_id },
      });
    }

    // call connect mutation
    return connect({
      brandCode: setting.brand_id,
      email: setting.email,

      // if client passed email automatically then consider this as user
      isUser: Boolean(clientPassedEmail),

      name: setting.name,
      data: setting.data,
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
