import React from 'react';
import SendWebhook from './components/sendWebhook';
import ActionResult from './components/ActionResult';

const Automations = props => {
  const { componentType, activeAction } = props;

  if (componentType === 'actionForm') {
    const { type } = activeAction;
    const [serviceName, contentType, action] = type
      .replace('.', ':')
      .split(':');

    switch (contentType) {
      case 'webhook':
        return <SendWebhook {...props} />;
      default:
        return null;
    }
  }
  if (componentType === 'historyActionResult') {
    return <ActionResult {...props} />;
  }
};

export default Automations;
