import React from 'react';
import ReplyFbMessage from './components/action/ReplyFbMessage';
import OptionalContent from './components/OptionalContent';
import TriggerForm from './components/trigger/TriggerForm';
import TriggerContent from './components/trigger/Content';

const Automations = (props) => {
  const { componentType, activeAction } = props;

  if (componentType === 'triggerForm') {
    return <TriggerForm {...props} />;
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
