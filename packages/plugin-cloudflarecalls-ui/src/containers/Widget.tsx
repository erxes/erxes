import React from 'react';
import Widget from '../components/Widget';

type Props = {
  callUserIntegrations: any;
  setHideIncomingCall?: (isHide: boolean) => void;
  hideIncomingCall?: boolean;
};

const WidgetContainer = (props: Props) => {
  return <Widget {...props} />;
};

export default WidgetContainer;
