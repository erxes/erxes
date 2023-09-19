import React from 'react';
import LoyaltyForm from './containers/LoyaltyForm';
import ScoreForm from './components/ScoreForm';
import SpinForm from './components/SpinForm';

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
      case 'voucher':
        return <LoyaltyForm {...props} />;
      case 'score':
        return <ScoreForm {...props} />;
      case 'spin':
        return <SpinForm {...props} />;

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
