import React from 'react';
import Widget from '../components/Widget';

type Props = {
  callIntegrationsOfUser: any;
  setConfig: any;
};
const WidgetContainer = (props: Props) => {
  return <Widget {...props} />;
};

export default WidgetContainer;
