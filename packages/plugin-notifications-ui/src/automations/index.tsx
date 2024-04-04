import React from 'react';
import SendNotification from './components/sendNotifcation';

const Automations = props => {
  const { componentType, activeAction } = props;

  if (componentType === 'actionForm') {
    const { type } = activeAction;

    const fixedType = type.replace('.', ':');

    const [_serviceName, contentType, _action] = fixedType.split(':');

    switch (contentType) {
      case 'appNotification':
        return <SendNotification {...props} />;
      default:
        return null;
    }
  }
  if (componentType === 'historyActionResult') {
    return <>{JSON.stringify(props?.result || {})}</>;
  }
};

export default Automations;
