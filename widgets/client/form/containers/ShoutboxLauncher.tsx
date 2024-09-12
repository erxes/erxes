import * as React from "react";
import ShoutboxLauncher from "../components/ShoutboxLauncher";
import { AppConsumer } from "./AppContext";

const container = () => (
  <AppConsumer>
    {({ isFormVisible, toggleShoutbox, getFormConfigs }) => {
      const leadData = getFormConfigs();

      return (
        <ShoutboxLauncher
          isFormVisible={isFormVisible}
          onClick={toggleShoutbox}
          color={leadData.themeColor || ""}
        />
      );
    }}
  </AppConsumer>
);

export default container;
