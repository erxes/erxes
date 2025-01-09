import React from "react";
import SendSms from "./components/sendSms";

const Automations = (props) => {
  const { componentType, activeAction, result } = props;

  // Log to help with debugging; remove in production

  if (componentType === "actionForm") {
    const { type } = activeAction;
    const fixedType = type.replace(".", ":");
    const [_serviceName, contentType] = fixedType.split(":");

    switch (contentType) {
      case "messagePro":
        return <SendSms {...props} />;
      default:
        // Handle unsupported content types
        console.warn(`Unsupported contentType: ${contentType}`);
        return null;
    }
  }

  if (componentType === "historyActionResult") {
    return <>{JSON.stringify(result || {})}</>;
  }

  return null; // Add a fallback return in case componentType doesn't match
};

export default Automations;