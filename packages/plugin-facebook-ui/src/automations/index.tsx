import React from 'react';
import ReplyFbMessage from './components/action/ReplyFbMessage';
import OptionalContent from './components/OptionalContent';
import MessageForm from './components/trigger/MessageForm';
import TriggerContent from './components/trigger/Content';
import CommnetForm from './components/trigger/CommentForm';

const Automations = (props) => {
  const { componentType, activeAction, activeTrigger } = props || {};

  if (componentType === 'triggerForm') {
    const [_serviceName, contentType] = activeTrigger?.type.split(':');

    switch (contentType) {
      case 'messages':
        return <MessageForm {...props} />;
      case 'comments':
        return <CommnetForm {...props} />;
      default:
        return null;
    }
  }

  if (componentType === 'triggerContent') {
    return <TriggerContent {...props} />;
  }

  if (componentType === 'optionalContent') {
    return <OptionalContent action={props.data} handle={props.handle} />;
  }

  if (componentType === 'actionForm') {
    const { type } = activeAction;
    const [_serviceName, contentType, _action] = type
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
    return <>{JSON.stringify(result || {})}</>;
  }
  if (componentType === 'historyName') {
    return <>{'-'}</>;
  }
};

export default Automations;
