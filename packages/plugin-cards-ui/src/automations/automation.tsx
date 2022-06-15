import React from 'react';
import BoardItemForm from './containers/BoardItemForm';
import SelectBoard from './components/SelectBoard';

const Automations = props => {
  const { componentType } = props;

  console.log('working............', componentType);

  switch (componentType) {
    case 'actionForm':
      return <BoardItemForm {...props} />;

    case 'selectBoard':
      return <SelectBoard {...props} />;

    default:
      return <div>hahahahahah</div>;
  }
};

export default Automations;
