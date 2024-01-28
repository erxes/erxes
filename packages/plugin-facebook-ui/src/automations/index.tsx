import React from 'react';
import ReplyFbMessage from './components/action/ReplyFbMessage';
import OptionalContent from './components/OptionalContent';
import TriggerForm from './components/trigger/TriggerForm';

const Automations = (props) => {
  const { componentType, activeAction } = props;

  if (componentType === 'triggerForm') {
    console.log({ props });
    return <TriggerForm {...props} />;
  }

  if (componentType === 'historyName') {
    return <>{'-'}</>;
  }

  if (componentType === 'optionalContent') {
    return <OptionalContent action={props.data} handle={props.handle} />;
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
    return <>{JSON.stringify(result || {})}</>;
  }
};

export default Automations;
