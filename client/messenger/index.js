/* eslint-disable react/jsx-filename-extension */

import { wsClient } from '../apollo-client';
import widgetConnect from '../widgetConnect';
import {
  connection,
  connect,
  getLocalStorageItem,
  setLocalStorageItem,
} from './connection';
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

      cachedCustomerId: getLocalStorageItem('customerId'),

      // if client passed email automatically then consider this as user
      isUser: Boolean(setting.email),

      name: setting.name,
      data: setting.data,
      browserInfo: setting.browserInfo,
    });
  },

  connectCallback: (data) => {
    const messengerData = data.messengerConnect;

    // save connection info
    connection.data = messengerData;

    // save customer id to identify visitor next time
    setLocalStorageItem('customerId', messengerData.customerId);

    // send connected message to ws server and server will save given
    // data to connection. So when connection closed, we will use
    // customerId to mark customer as not active
    wsClient.sendMessage({ type: 'messengerConnected', value: messengerData });
  },

  AppContainer: App,

  reducers,
});
