import React from 'react';
import HistoryName from './components/HistoryName';

const Automation = props => {
  const { componentType } = props;
  if(componentType ==='HistoryName'){
    return <HistoryName{...props}/>;
  }
  else
  {
    return null;
  }
};

export default Automation;
