import '@nateradebaugh/react-datetime/scss/styles.scss';
import * as React from 'react';
import DumbApp from '../components/App';
import '../sass/style.min.css';
// import '../sass/style.css';

import * as dayjs from 'dayjs';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import client from '../../apollo-client';
import { getMessengerData } from '../utils/util';
import { ConversationProvider } from '../context/Conversation';
import MessageHandler from '../components/MessageHandler';
import { ConfigProvider } from '../context/Config';
import { RouterProvider } from '../context/Router';
import { MessageProvider } from '../context/Message';
import { ApolloProvider } from '@apollo/client';
import { AnimateSharedLayout } from 'framer-motion';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const App = () => {
  const { showLauncher } = getMessengerData();

  return (
    <ApolloProvider client={client}>
      <ConfigProvider>
        <RouterProvider>
          <ConversationProvider>
            <MessageHandler>
              <MessageProvider>
                <DumbApp showLauncher={showLauncher} />
              </MessageProvider>
            </MessageHandler>
          </ConversationProvider>
        </RouterProvider>
      </ConfigProvider>
    </ApolloProvider>
  );
};

export default App;
