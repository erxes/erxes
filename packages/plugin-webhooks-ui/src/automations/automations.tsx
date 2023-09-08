import React from 'react';
import SendWebhook from './components/sendWebhook';

const Automations = props => {
  const { componentType, activeAction } = props;

  console.log({ componentType });

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
    const { result } = props;
    return <>{result}</>;
  }
};

export default Automations;
