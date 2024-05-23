import React from "react";
import Widget from "../components/Widget";

type Props = {
  callUserIntegrations: any;
  setConfig: any;
  setHideIncomingCall?: (isHide: boolean) => void;
  hideIncomingCall?: boolean;
  currentCallConversationId: string;
};

const WidgetContainer = (props: Props) => {
  return <Widget {...props} />;
};

export default WidgetContainer;
