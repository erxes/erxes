/* eslint-disable react/jsx-filename-extension */

import { wsClient } from '../apollo-client';
import widgetConnect from '../widgetConnect';
import { connection, connect } from './connection';
import reducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  connectMutation: (event) => {
    const settings = event.data.settings;

    // save user passed settings on connection. using this information in action
    connection.settings = settings;

    if (!settings.email) {
      return Promise.resolve({ data: {} });
    }

    // call connect mutation
    return connect({
      brandCode: settings.brand_id,
      email: settings.email,
      name: settings.name,
    });
  },

  connectCallback: (data) => {
    const messengerData = data.messengerConnect;

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
