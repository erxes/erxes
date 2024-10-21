import * as React from "react";
import Callout from "../components/Callout";
import { AppConsumer } from "./AppContext";

const container = () => (
  <AppConsumer>
    {({ showForm, setHeight, getIntegrationConfigs }) => {
      const leadData = getIntegrationConfigs();
      const { callout, themeColor } = leadData;

      return (
        <Callout
          onSubmit={showForm}
          setHeight={setHeight}
          configs={callout || {}}
          color={themeColor || ""}
          hasTopBar={true}
        />
      );
    }}
  </AppConsumer>
);

export default container;
