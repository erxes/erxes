import React from 'react';
import LoyaltyForm from './containers/LoyaltyForm';

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

      break;

    default:
      return null;
  }
};

export default Automations;
