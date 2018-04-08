/* eslint-disable react/jsx-filename-extension */

import widgetConnect from '../widgetConnect';
import { setLocale } from '../utils';
import { connection } from './connection';
import { connect } from './actions';
import reducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  postParams: {
    fromForms: true,
  },

  connectMutation: (event) => {
    const { setting, hasPopupHandlers } = event.data;

    connection.setting = setting;
    connection.hasPopupHandlers = hasPopupHandlers;

    // call connect mutation
    return connect(setting.brand_id, setting.form_id);
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

  reducers,
});
