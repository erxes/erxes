/* eslint-disable react/jsx-filename-extension */

import widgetConnect from '../widgetConnect';
import { connection } from './connection';
import { connect } from './actions';
import reducers from './reducers';
import { App } from './containers';
import './sass/style.scss';

widgetConnect({
  connectMutation: (event) => {
    const settings = event.data.settings;

    // call connect mutation
    return connect(settings.brand_id, settings.form_id);
  },

  connectCallback: (data) => {
    // save connection info
    connection.data = data.formConnect;
  },

  AppContainer: App,

  reducers,
});
