import * as React from "react";
import { Integrations } from "../components";
import { connection } from "../connection";
import { AppConsumer } from "./AppContext";

const container = () => {
  return (
    <AppConsumer>
      {({ getMessengerData }) => {
        return (
          <Integrations
            brandCode={connection.setting.brand_id}
            formCode={getMessengerData().formCode}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
