import React from 'react';
import HistoryName from './components/HistoryName';

const Automation = props => {
  const { componentType } = props;

  switch (componentType) {
    case 'HistoryName':
      return <HistoryName {...props} />;

    default:
      return null;
  }
};

export default Automation;
