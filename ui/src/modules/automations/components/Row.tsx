import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { IAutomation } from '../types';
import ActionButtons from 'modules/common/components/ActionButtons';
import WithPermission from 'modules/common/components/WithPermission';
import Tip from 'modules/common/components/Tip';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import Icon from 'modules/common/components/Icon';

type Props = {
  automation: IAutomation;
  history: any;
  isChecked: boolean;
  toggleBulk: (automation: IAutomation, isChecked?: boolean) => void;
};

function ActionRow({ automation, history, isChecked, toggleBulk }: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(automation, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(`/automations/details/${automation._id}`);
  };

  const editAction = () => {
    return (
      <Button btnStyle="link">
        <Tip text="Edit" placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );
  };

  const removeAction = () => {
    return (
      <WithPermission action="automationssRemove">
        <Tip text={__('Delete')} placement="top">
          <Button btnStyle="link" icon="times-circle" />
        </Tip>
      </WithPermission>
    );
  };

  return (
    <tr onClick={onTrClick}>
      <td id="automationsCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td> {automation.name} </td>
      <td> {automation.status} </td>
      <td>
        <ActionButtons>
          {editAction()}
          {removeAction()}
        </ActionButtons>
      </td>
    </tr>
  );
}

export default ActionRow;
