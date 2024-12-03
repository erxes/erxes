import React from 'react';
import BoardItemForm from './containers/BoardItemForm';
import Checklist from './components/Checklist';
import SelectBoard from './components/SelectBoard';
import ActionResult from './components/ActionResult';
import TriggerForm from './components/TriggerForm';

const checkListOptionalContent = ({ data, handle }) => {
  const { isActiveTrack, items = [] } = data?.config || {};
  if (!isActiveTrack) {
    return null;
  }

  console.log({ data });

  return (
    <li key={`${data.id}-checklist-right`} className="optional-connect">
      {items
        .filter(item => item?.isChecked)
        .map(item => (
          <li>{item.label}</li>
        ))}
      {handle('deal')}
    </li>
  );
};

const renderActionForm = props => {
  const { activeAction } = props;
  const actionForms = {
    'sales:checklist.create': <Checklist {...props} />,
    'sales:deal.create': <BoardItemForm {...props} />,
  };

  return actionForms[activeAction?.type];
};

const Automations = props => {
  const { componentType, target } = props;
  switch (componentType) {
    case 'actionForm':
      return renderActionForm(props);

    case 'triggerForm':
      return <TriggerForm {...props} />;

    case 'selectBoard':
      return <SelectBoard {...props} />;
    case 'optionalContent':
      return checkListOptionalContent(props);

    case 'historyActionResult':
      return <ActionResult {...props} />;

    case 'historyName':
      return target.name;

    default:
      return null;
  }
};

export default Automations;
