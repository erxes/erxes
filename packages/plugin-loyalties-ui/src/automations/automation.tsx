import React from 'react';
import LoyaltyForm from './containers/LoyaltyForm';
import ChangeScore from './components/ChangeScore';

const Automations = props => {
  const {
    componentType,
    activeAction: { type }
  } = props;

  switch (componentType) {
    case 'actionForm':
      if (type.includes('voucher')) {
        return <LoyaltyForm {...props} />;
      }
      if (type.includes('score')) {
        return <ChangeScore {...props} />;
      }

      break;

    default:
      return null;
  }
};

export default Automations;
