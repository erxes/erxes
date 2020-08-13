import gql from 'graphql-tag';
import client, { wsLink } from '../apollo-client';
import { getLocalStorageItem, setLocalStorageItem } from '../common';
import { getEnv, setLocale } from '../utils';
import widgetConnect from '../widgetConnect';
import { connection } from './connection';
import { App } from './containers';
import graphqTypes from './graphql';
import './sass/style.scss';
import { IConnectResponse } from './types';

const envs = getEnv();

fetch(`${envs.API_URL}/set-frontend-cookies?envs=${JSON.stringify(envs)}`, {
  credentials: 'include'
}).then(() => {
  widgetConnect({
    connectMutation: (event: MessageEvent) => {
      const setting = event.data.setting;

      connection.setting = setting;

      return client.mutate({
        mutation: gql(graphqTypes.connect),
        variables: {
          brandCode: setting.brand_id,
          email: setting.email,
          phone: setting.phone,
          code: setting.code,

          cachedCustomerId: getLocalStorageItem('customerId'),

          // if client passed email automatically then consider this as user
          isUser: Boolean(setting.email),

          name: setting.name,
          data: setting.data,
          companyData: setting.companyData
        }
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

      // TODO: temporarily disabling typescript checker
      const wsLinkFaker: any = wsLink;

      wsLinkFaker.subscriptionClient.sendMessage({
        type: 'messengerConnected',
        value: messengerData
      });
    },

    AppContainer: App
  });
});
