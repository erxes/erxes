import "@nateradebaugh/react-datetime/scss/styles.scss";
import "../sass/style.min.css";

import * as React from "react";
import * as dayjs from "dayjs";
import * as localizedFormat from "dayjs/plugin/localizedFormat";
import * as relativeTime from "dayjs/plugin/relativeTime";

import { ApolloProvider } from "@apollo/client";
import { ConfigProvider } from "../context/Config";
import { ConversationProvider } from "../context/Conversation";
import DumbApp from "../components/App";
import MessageHandler from "../components/MessageHandler";
import { MessageProvider } from "../context/Message";
import { RoomProvider } from "./call/RoomProvider";
import { RouterProvider } from "../context/Router";
import { TicketProvider } from "../context/Ticket";
import client from "../../apollo-client";
import { getMessengerData } from "../utils/util";

// import '../sass/style.css';

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
                <RoomProvider>
                  <TicketProvider>
                    <DumbApp showLauncher={showLauncher} />
                  </TicketProvider>
                </RoomProvider>
              </MessageProvider>
            </MessageHandler>
          </ConversationProvider>
        </RouterProvider>
      </ConfigProvider>
    </ApolloProvider>
  );
};

export default App;
