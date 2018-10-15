import * as React from "react";
import { __ } from "../../utils";
import { ConversationList } from "../containers";
import { IntegrationItem } from "./";

function Integrations() {
  return (
    <IntegrationItem title="Recent conversations">
      <ConversationList />
    </IntegrationItem>
  );
}

export default Integrations;
