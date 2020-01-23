import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import client from './apollo-client';

// base connect function for all widgets
const widgetConnect = (params) => {
  const {
    postParams,
    connectMutation,
    connectCallback,
    AppContainer,
  } = params;

  window.addEventListener('message', (event) => {
    // connect to api using passed setting
    if (!(event.data.fromPublisher && event.data.setting)) {
      return;
    }

    // call connect mutation
    connectMutation(event)
      .then(({ data }) => {
        // check connection and save connection info
        connectCallback(data);

        // notify parent window that connected
        window.parent.postMessage(
          {
            fromErxes: true,
            ...postParams,
            message: 'connected',
            connectionInfo: data,
            setting: event.data.setting,
          },
          '*',
        );

        const style = document.createElement("style");

        style.appendChild(document.createTextNode(event.data.setting.css || ""));

        const head = document.querySelector("head");

        if (head) {
          head.appendChild(style);
        }

        // render root react component
        ReactDOM.render(
          <ApolloProvider client={client}>
             <AppContainer />
          </ApolloProvider>,
          document.getElementById('root'),
        );
      })

      .catch((error) => {
        console.log(error); // eslint-disable-line
      });
  });
};

export default widgetConnect;
