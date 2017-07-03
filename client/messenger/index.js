/* eslint-disable react/jsx-filename-extension */

import { wsClient } from '../apollo-client';
import widgetConnect from '../widgetConnect';
import { connection, connect } from './connection';
import reducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  connectMutation: (event) => {
    const setting = event.data.setting;

    // call connect mutation
    return connect({
      brandCode: setting.brand_id,
      email: setting.email,

      cachedCustomerId: localStorage.getItem('erxesCustomerId'),

      // if client passed email automatically then consider this as user
      isUser: Boolean(setting.email),

      name: setting.name,
      data: setting.data,

      browserInfo: {
        url: window.parent.location.pathname, // eslint-disable-line
        language: window.parent.navigator.language, // eslint-disable-line
      },
    });
  },

  connectCallback: (data) => {
    const messengerData = data.messengerConnect;

    // save connection info
    connection.data = messengerData;

    // save customer id to identify visitor next time
    localStorage.setItem('erxesCustomerId', messengerData.customerId);

    // send connected message to ws server and server will save given
    // data to connection. So when connection closed, we will use
    // customerId to mark customer as not active
    wsClient.sendMessage({ type: 'messengerConnected', value: messengerData });
  },

  AppContainer: App,

  reducers,
});
