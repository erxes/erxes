import React from 'react';
import HistoryName from './components/HistoryName';
import SelectReciepents from './components/SelectReciepents';

const Automations = props => {
  const { componentType } = props;

  switch (componentType) {
    case 'historyName':
      return <HistoryName {...props} />;
    case 'selectReciepents':
      return <SelectReciepents {...props} />;
    default:
      return null;
  }
};

export default Automations;
