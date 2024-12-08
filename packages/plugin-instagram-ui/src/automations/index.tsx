import React from "react";
import ReplyFbMessage from "./components/action/ReplyFbMessage";
import OptionalContent from "./components/OptionalContent";
import MessageForm from "./components/trigger/MessageForm";
import TriggerContent from "./components/trigger/Content";
import CommnetForm from "./components/trigger/CommentForm";
import Label from "@erxes/ui/src/components/Label";
import Tip from "@erxes/ui/src/components/Tip";
import { Link } from "react-router-dom";
import ReplyComments from "./components/action/ReplyComment";
import AdsForm from "./components/trigger/AdsForm";

const Automations = props => {
  const { componentType, activeAction, activeTrigger, target } = props || {};
  if (componentType === "triggerForm") {
    const [_serviceName, contentType] = activeTrigger?.type.split(":");

    switch (contentType) {
      case "messages":
        return <MessageForm {...props} />;
      case "comments":
        return <CommnetForm {...props} />;
      case "ads":
        return <AdsForm {...props} />;
      default:
        return null;
    }
  }

  if (componentType === "triggerContent") {
    return <TriggerContent {...props} />;
  }

  if (componentType === "optionalContent") {
    return <OptionalContent action={props.data} handle={props.handle} />;
  }

  if (componentType === "actionForm") {
    const { type } = activeAction;
    const [_serviceName, contentType, _action] = type
      .replace(".", ":")
      .split(":");

    switch (contentType) {
      case "messages":
        return <ReplyFbMessage {...props} />;
      case "comments":
        return <ReplyComments {...props} />;
      default:
        return null;
    }
  }

  if (componentType === "historyActionResult") {
    const { result } = props;

    if (result?.error) {
      return (
        <Tip text={result?.error}>
          <Label lblStyle="danger">{"Error"}</Label>
        </Tip>
      );
    }

    return <Label lblStyle="success">{"Sent"}</Label>;
  }

  if (componentType === "historyName") {
    return (
      <>
        <Link target="_blank" to={`/contacts/details/${target?.customerId}`}>
          {"See Customer"}
        </Link>
        <Link target="_blank" to={`/inbox/index?_id=${target?.conversationId}`}>
          {`\u00A0/\u00A0`}
          {"See Conversation"}
        </Link>
      </>
    );
  }
};

export default Automations;
