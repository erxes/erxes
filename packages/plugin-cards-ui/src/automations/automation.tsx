import React from 'react';
import BoardItemForm from './containers/BoardItemForm';
import SelectBoard from './components/SelectBoard';
import ActionResult from './components/ActionResult';

const Automations = props => {
  const { componentType } = props;

  switch (componentType) {
    case 'actionForm':
      return <BoardItemForm {...props} />;

    case 'selectBoard':
      return <SelectBoard {...props} />;

    case 'actionResult':
      return <ActionResult {...props} />;

    default:
      return null;
  }
};

export default Automations;
