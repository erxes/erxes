import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { IAutomation } from '../types';
import dayjs from 'dayjs';
import Label from 'modules/common/components/Label';
import Icon from 'modules/common/components/Icon';
import { DateWrapper } from 'modules/common/styles/main';
import s from 'underscore.string';
import { FlexItem } from 'modules/companies/styles';
import NameCard from 'modules/common/components/nameCard/NameCard';
import ActionButtons from 'modules/common/components/ActionButtons';
import { Link } from 'react-router-dom';
import Button from 'modules/common/components/Button';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import WithPermission from 'modules/common/components/WithPermission';

type Props = {
  automation: IAutomation;
  history: any;
  isChecked: boolean;
  toggleBulk: (automation: IAutomation, isChecked?: boolean) => void;
  removeAutomations: (automations: IAutomation[]) => void;
};

function ActionRow({
  automation,
  history,
  isChecked,
  toggleBulk,
  removeAutomations
}: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(automation, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onNameClick = () => {
    history.push(`/automations/details/${automation._id}`);
  };

  const editAction = () => {
    return (
      <Link to={`/automations/details/${automation._id}`}>
        <Button btnStyle="link">
          <Tip text={__('Edit')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  };

  const removeAction = () => {
    const onRemove = () => removeAutomations([automation]);

    return (
      <WithPermission action="automationsRemove">
        <Tip text={__('Delete')} placement="top">
          <Button
            id="automationDelete"
            btnStyle="link"
            onClick={onRemove}
            icon="times-circle"
          />
        </Tip>
      </WithPermission>
    );
  };

  const {
    name,
    status,
    updatedAt,
    createdAt,
    createdUser,
    updatedUser,
    triggers,
    actions
  } = automation;

  const isActive = status !== 'draft' ? true : false;
  const labelStyle = isActive ? 'success' : 'simple';

  return (
    <tr>
      <td id="automationsCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td onClick={onNameClick}> {name} </td>
      <td>
        <Label lblStyle={labelStyle}>{status}</Label>
      </td>
      <td className="text-primary">
        <Icon icon="swatchbook" />
        <b> {s.numberFormat(triggers.length)}</b>
      </td>
      <td className="text-warning">
        <Icon icon="share-alt" />
        <b> {s.numberFormat(actions.length)}</b>
      </td>
      <td>
        <FlexItem>
          <NameCard user={updatedUser} avatarSize={30} />
        </FlexItem>
      </td>
      <td>
        <FlexItem>
          <NameCard user={createdUser} avatarSize={30} />
        </FlexItem>
      </td>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>{dayjs(updatedAt || new Date()).format('ll')}</DateWrapper>
      </td>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>{dayjs(createdAt || new Date()).format('ll')}</DateWrapper>
      </td>
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
