import * as React from "react";
import { Integrations } from "../components";
import { connection } from "../connection";
import { AppConsumer } from "./AppContext";

const container = () => {
  return (
    <AppConsumer>
      {({ getMessengerData }) => {
        const { formCode, showChat } = getMessengerData();

        return (
          <Integrations
            brandCode={connection.setting.brand_id}
            formCode={formCode}
            hideConversations={!showChat}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
