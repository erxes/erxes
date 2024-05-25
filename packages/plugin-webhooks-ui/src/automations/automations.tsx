import React from 'react';
import SendWebhook from './components/sendWebhook';
import ActionResult from './components/ActionResult';

const Automations = (props) => {
  const { componentType, activeAction } = props;

  if (componentType === 'actionForm') {
    const { type } = activeAction;
    const [_serviceName, contentType, _action] = type
      .replace('.', ':')
      .split(':');

    const forms = {
      webhook: <SendWebhook {...props} />,
    };

    return forms[contentType] || null;
  }
  if (componentType === 'historyActionResult') {
    return <ActionResult {...props} />;
  }
};

export default Automations;
