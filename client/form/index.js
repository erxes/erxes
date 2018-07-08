import gql from 'graphql-tag';
import client from '../apollo-client';
import widgetConnect from '../widgetConnect';
import { setLocale } from '../utils';
import { connection } from './connection';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  postParams: {
    source: 'fromForms',
  },

  connectMutation: (event) => {
    const { setting, hasPopupHandlers } = event.data;

    connection.setting = setting;
    connection.hasPopupHandlers = hasPopupHandlers;

    // call connect mutation
    return client.mutate({
      mutation: gql`
        mutation formConnect($brandCode: String!, $formCode: String!) {
          formConnect(brandCode: $brandCode, formCode: $formCode) {
            integrationId,
            integrationName,
            languageCode,
            formId,
            formData,
          }
        }`,

      variables: {
        brandCode: setting.brand_id,
        formCode: setting.form_id,
      },
    });
  },

  connectCallback: (data) => {
    if (!data.formConnect) {
      throw new Error('Integration not found');
    }

    // save connection info
    connection.data = data.formConnect;

    // set language
    setLocale(data.formConnect.languageCode);
  },

  AppContainer: App,
});
