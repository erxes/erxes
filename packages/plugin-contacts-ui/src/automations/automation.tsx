import React from 'react';
import HistoryName from './components/HistoryName';

const Automations = props => {
  const { componentType } = props;

  switch (componentType) {
    case 'historyName':
      return <HistoryName {...props} />;

    default:
      return null;
  }
};

export default Automations;
