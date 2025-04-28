import {
  getLocalStorageItem,
  initStorage,
  setLocalStorageItem,
} from '../common';

import { IConnectResponse } from './types';
import asyncComponent from '../AsyncComponent';
import client from '../apollo-client';
import { connection } from './connection';
import { enabledServicesQuery } from '../form/graphql';
import gql from 'graphql-tag';
import graphqTypes from './graphql';
import { setLocale } from '../utils';
import widgetConnect from '../widgetConnect';

const App = asyncComponent(
  () => import(/* webpackChunkName: "MessengerApp" */ './containers/App'),
);

widgetConnect({
  connectMutation: async (event: MessageEvent) => {
    const { setting, storage } = event.data;

    connection.setting = setting;

    initStorage(storage);

    try {
      const res = await client.query({
        query: gql(enabledServicesQuery),
        fetchPolicy: 'network-only',
      });

      if (res.data.enabledServices) {
        connection.enabledServices = res.data.enabledServices;
      }
    } catch (error) {
      console.error('Error fetching enabledServices:', error);
    }
    const cachedCustomerId = getLocalStorageItem('customerId');

    let visitorId;

    if (!cachedCustomerId) {
      const { getVisitorId } = await import('../widgetUtils');

      visitorId = await getVisitorId();
    }

    const isCallEnabled = connection.enabledServices.cloudflarecalls;

    return client.mutate({
      mutation: gql(graphqTypes.connect(isCallEnabled)),
      variables: {
        brandCode: setting.brand_id,
        email: setting.email,
        phone: setting.phone,
        code: setting.code,
        cachedCustomerId,
        visitorId,
        // if client passed email automatically then consider this as user
        isUser: Boolean(setting.email),

        name: setting.name,
        data: setting.data,
        companyData: setting.companyData,
      },
    });
  },

  connectCallback: (data: { widgetsMessengerConnect: IConnectResponse }) => {
    const messengerData = data.widgetsMessengerConnect;

    if (!messengerData.integrationId) {
      throw new Error('Integration not found');
    }

    // save connection info
    connection.data = messengerData;

    // set language
    setLocale(connection.setting.language || messengerData.languageCode);

    // save customer id to identify visitor next time
    setLocalStorageItem('customerId', messengerData.customerId);

    // send connected message to ws server and server will save given
    // data to connection. So when connection closed, we will use
    // customerId to mark customer as not active

    // WebSocketLink will send this data to the server when subscribing or sending requests.
    // Server will save given
    // data to corresponding socket that handles this clients connection.
    // So when connection is closed, we will use
    // customerId to mark customer as not active
    setLocalStorageItem('messengerDataJson', JSON.stringify(messengerData));
  },

  AppContainer: App,
});
