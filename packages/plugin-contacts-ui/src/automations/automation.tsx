import React from 'react';
import HistoryName from './components/HistoryName';
import SelectRecipients from './components/SelectRecipients';

const Automations = props => {
  const { componentType } = props;

  switch (componentType) {
    case 'historyName':
      return <HistoryName {...props} />;
    case 'selectRecipients':
      return <SelectRecipients {...props} />;
    default:
      return null;
  }
};

export default Automations;
