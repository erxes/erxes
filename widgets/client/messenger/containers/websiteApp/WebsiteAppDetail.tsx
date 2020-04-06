import * as React from "react";
import WebsiteAppDetail from "../../components/websiteApp/WebsiteAppDetail";
import { AppConsumer } from "../AppContext";

const WebsiteAppDetailContainer = () => {
  return (
    <AppConsumer>
      {({ changeRoute, getMessengerData }) => {
        const config = getMessengerData().websiteAppData;

        if (!config) {
          return null;
        }

        return <WebsiteAppDetail changeRoute={changeRoute} config={config} />;
      }}
    </AppConsumer>
  );
};

export default WebsiteAppDetailContainer;
