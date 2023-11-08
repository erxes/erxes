import React from 'react';

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

    return <>Fuck</>;
  }
  if (componentType === 'historyActionResult') {
    const { result } = props;
    return <>{result}</>;
  }
};

export default Automations;
