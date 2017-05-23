/* eslint-disable react/jsx-filename-extension */

import widgetConnect from '../widgetConnect';
import { connection } from './connection';
import { connect } from './actions';
import reducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  connectMutation: (event) => {
    const setting = event.data.setting;

    connection.setting = setting;

    // call connect mutation
    return connect(setting.brand_id, setting.form_id);
  },

  connectCallback: (data) => {
    if (!data.formConnect) {
      throw new Error('Integration not found');
    }

    // save connection info
    connection.data = data.formConnect;
  },

  AppContainer: App,

  reducers,
});
