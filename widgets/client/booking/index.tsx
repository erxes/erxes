import * as dayjs from 'dayjs';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import 'erxes-icon/css/erxes.min.css';

import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import client from '../apollo-client';
import { connection } from './connection';
import './sass/style.scss';
import { App } from './containers';
import { increaseViewCount } from './containers/utils';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const render = () => {
  increaseViewCount(connection.setting.booking_id);

  // render root react component
  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,

    document.getElementById('root')
  );
};

const settings = (window as any).bookingSettings;

if (settings) {
  connection.setting = settings;
  render();
} else {
  window.addEventListener('message', event => {
    const data = event.data;

    if (!(data.fromPublisher && data.setting)) {
      return;
    }

    connection.setting = event.data.setting;

    render();
  });
}
