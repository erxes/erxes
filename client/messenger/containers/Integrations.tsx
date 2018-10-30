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
            brandId={connection.setting.brand_id}
            formId={getMessengerData().formId}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
