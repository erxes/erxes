import * as React from "react";
import { Integrations } from "../components";
import { AppConsumer } from "./AppContext";
import { connection } from "../connection";

const container = () => {
  return (
    <AppConsumer>
      {({ getMessengerData }) => {
        return (
          <Integrations
            brandId={connection.setting.brand_id}
            formId={getMessengerData().formId}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
