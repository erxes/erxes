import '@nateradebaugh/react-datetime/css/react-datetime.css';
import * as React from 'react';
import * as dayjs from 'dayjs';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import * as ReactDOM from 'react-dom';
import { datadogRum } from '@datadog/browser-rum';
import { ApolloProvider } from 'react-apollo';
import client from './apollo-client';
import { getEnv } from './utils';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const { DD_APPLICATION_ID, DD_CLIENT_TOKEN, API_URL } = getEnv();

datadogRum.init({
  applicationId: DD_APPLICATION_ID,
  clientToken: DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'office-widgets',
  sampleRate: 100,
  trackInteractions: true,
  allowedTracingOrigins: [API_URL || '']
});

// base connect function for all widgets
const widgetConnect = params => {
  const { postParams, connectMutation, connectCallback, AppContainer } = params;

  window.addEventListener('message', event => {
    // connect to api using passed setting
    if (!(event.data.fromPublisher && event.data.setting)) {
      return;
    }

    // call connect mutation
    connectMutation(event)
      .then(response => {
        if (!response) {
          return;
        }

        const { data } = response;

        // check connection and save connection info
        connectCallback(data);

        // notify parent window that connected
        window.parent.postMessage(
          {
            fromErxes: true,
            ...postParams,
            message: 'connected',
            connectionInfo: data,
            setting: event.data.setting
          },
          '*'
        );

        const style = document.createElement('style');

        style.appendChild(
          document.createTextNode(event.data.setting.css || '')
        );

        const head = document.querySelector('head');

        if (head) {
          head.appendChild(style);
        }

        // render root react component
        ReactDOM.render(
          <ApolloProvider client={client}>
            <AppContainer />
          </ApolloProvider>,
          document.getElementById('root')
        );
      })

      .catch(error => {
        console.log(error); // eslint-disable-line
      });
  });
};

export default widgetConnect;
