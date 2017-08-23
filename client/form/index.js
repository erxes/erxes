/* eslint-disable react/jsx-filename-extension */

import widgetConnect from '../widgetConnect';
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

    window.addEventListener('message', (event) => {
      if (event.data.fromPublisher) {
        // receive show popup command from publisher
        if (event.data.action === 'show') {
          document.querySelector('.modal-form').className = 'modal-form open';
        }

        // receive hide popup command from publisher
        if (event.data.action === 'hide') {
          document.querySelector('.modal-form').className = 'modal-form';
        }
      }
    });
  },

  AppContainer: App,

  reducers,
});
