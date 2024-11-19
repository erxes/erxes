import * as React from 'react';
import { createRoot } from 'react-dom/client';
import client from './apollo-client';
import { getEnv } from './utils';

// base connect function for all widgets
const widgetConnect = (params) => {
  const { postParams, connectMutation, connectCallback, AppContainer } = params;

  window.addEventListener('message', (event) => {
    // connect to api using passed setting
    if (!(event.data.fromPublisher && event.data.setting)) {
      return;
    }

    // call connect mutation
    connectMutation(event)
      .then(async (response) => {
        const { ApolloProvider } = await import('@apollo/client');

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
            apiUrl: getEnv()?.API_URL || '',
            setting: event.data.setting,
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

        const container = document.getElementById('root');
        const root = createRoot(container); // createRoot(container!) if you use TypeScript
        root.render(
          <ApolloProvider client={client}>
            <AppContainer />
          </ApolloProvider>
        );
      })

      .catch((error) => {
        console.error(error); // eslint-disable-line
      });
  });
};

export default widgetConnect;
