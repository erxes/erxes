import gql from 'graphql-tag';
import client from '../apollo-client';
import { getLocalStorageItem } from '../common';
import { setLocale } from '../utils';
import widgetConnect from '../widgetConnect';
import { connection } from './connection';
import { App } from './containers';
import { formConnectMutation } from './graphql';
import './sass/style.scss';
import { IConnectResponse } from './types';

widgetConnect({
  postParams: {
    source: 'fromForms'
  },

  connectMutation: (event: MessageEvent) => {
    const { setting, hasPopupHandlers } = event.data;

    connection.setting = setting;
    connection.hasPopupHandlers = hasPopupHandlers;

    // call connect mutation
    return client.mutate({
      mutation: gql(formConnectMutation),
      variables: {
        brandCode: setting.brand_id,
        formCode: setting.form_id,
        cachedCustomerId: getLocalStorageItem('customerId')
      }
    });
  },

  connectCallback: (data: { widgetsLeadConnect: IConnectResponse }) => {
    const response = data.widgetsLeadConnect;

    if (!response) {
      throw new Error('Integration not found');
    }

    // save connection info
    connection.data = response;

    // set language
    setLocale(response.integration.languageCode || 'en');
  },

  AppContainer: App
});
