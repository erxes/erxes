import React from "react";
import ReplyFbMessage from "./components/action/ReplyFbMessage";
import OptionalContent from "./components/OptionalContent";
import MessageForm from "./components/trigger/MessageForm";
import TriggerContent from "./components/trigger/Content";
import Label from "@erxes/ui/src/components/Label";
import Tip from "@erxes/ui/src/components/Tip";
import { Link } from "react-router-dom";
import HistoryName from "./components/HistoryName";
const Automations = (props) => {
  const { componentType, activeAction, activeTrigger, target } = props || {};

  if (componentType === "triggerForm") {
    const [_serviceName, contentType] = activeTrigger?.type.split(":");
    switch (contentType) {
      case "HistoryName":
        return <HistoryName {...props} />;
      case "messages":
        return <MessageForm {...props} />;
      default:
        return null;
    }
  }

  if (componentType === "triggerContent") {
    return <TriggerContent {...props} />;
  }

  if (componentType === "optionalContent") {
    return (
      <OptionalContent
        action={props.data}
        handle={props.handle}
      />
    );
  }

  if (componentType === "actionForm") {
    const { type } = activeAction;
    const [_serviceName, contentType, _action] = type
      .replace(".", ":")
      .split(":");

    switch (contentType) {
      case "messages":
        return <ReplyFbMessage {...props} />;
      default:
        return null;
    }
  }

  if (componentType === "historyActionResult") {
    const { result } = props;

    if (result?.error) {
      return (
        <Tip text={result?.error}>
          <Label lblStyle='danger'>{"Error"}</Label>
        </Tip>
      );
    }

    return <Label lblStyle='success'>{"Sent"}</Label>;
  }
};

export default Automations;
