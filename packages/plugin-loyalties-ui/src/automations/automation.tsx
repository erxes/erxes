import React from 'react';
import PromotionForm from './components/PromotionForm';
import ScoreForm from './components/ScoreForm';
import SpinForm from './components/SpinForm';
import LoyaltyForm from './containers/LoyaltyForm';

const Automations = (props) => {
  const { componentType, activeAction, activeTrigger } = props;

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

  if (componentType === 'triggerForm') {
    const [_serviceName, contentType] = activeTrigger?.type.split(':');

    if (contentType === 'promotion') {
      return <PromotionForm {...props} />;
    }

    return null;
  }
};

export default Automations;
