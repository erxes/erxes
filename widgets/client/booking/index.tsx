import 'erxes-icon/css/erxes.min.css';
import client from '../apollo-client';
import { connection } from './connection';
import './sass/style.scss';
import { App } from './containers';

import gql from 'graphql-tag';
import { initStorage } from '../common';
import { setLocale } from '../utils';
import widgetConnect from '../widgetConnect';
import { widgetsConnectMutation } from './graphql';
import './sass/style.scss';

widgetConnect({
  postParams: {
    source: 'fromBookings'
  },

  connectMutation: (event: MessageEvent) => {
    const { setting, storage } = event.data;

    connection.setting = setting;

    initStorage(storage);

    // call connect mutation
    return client
      .mutate({
        mutation: gql(widgetsConnectMutation),
        variables: {
          _id: setting.integration_id
        }
      })
      .catch(e => {
        console.log(e.message);
      });
  },

  connectCallback: (data: { widgetsBookingConnect: any }) => {
    const response = data.widgetsBookingConnect;

    if (!response) {
      throw new Error('Integration not found');
    }

    // save connection info
    connection.data.integration = response;

    // set language
    setLocale(response.languageCode || 'en');
  },

  AppContainer: App
});
