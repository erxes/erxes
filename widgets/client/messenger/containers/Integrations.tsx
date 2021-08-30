import * as React from "react";
import { Integrations } from "../components";
import { connection } from "../connection";
import { AppConsumer } from "./AppContext";

const container = () => {
  return (
    <AppConsumer>
      {({ getMessengerData }) => {
        const { formCodes, showChat, websiteApps } = getMessengerData();

        return (
          <Integrations
            brandCode={connection.setting.brand_id}
            formCodes={formCodes}
            websiteApps={websiteApps}
            hideConversations={!showChat}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
