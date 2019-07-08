import * as React from "react";
import { App } from "../components";
import { AppConsumer, AppProvider } from "./AppContext";

const container = () => (
  <AppProvider>
    <AppConsumer>
      {({ isMessengerVisible, saveBrowserInfo, getMessengerData }) => (
        <App
          isMessengerVisible={isMessengerVisible}
          saveBrowserInfo={saveBrowserInfo}
          showLauncher={getMessengerData().showLauncher}
        />
      )}
    </AppConsumer>
  </AppProvider>
);

export default container;
