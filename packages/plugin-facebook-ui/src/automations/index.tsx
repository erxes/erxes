import React from 'react';
import ReplyFbMessage from './components/ReplyFbMessage';

const Automations = props => {
  const { componentType, activeAction } = props;

  if (componentType === 'historyActionResult') {
    return <>{'-'}</>;
  }

  if (componentType === 'actionForm') {
    const { type } = activeAction;
    const [serviceName, contentType, action] = type
      .replace('.', ':')
      .split(':');

    switch (contentType) {
      case 'messages':
        return <ReplyFbMessage {...props} />;
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
