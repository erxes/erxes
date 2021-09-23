import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { IAutomation } from '../types';
import dayjs from 'dayjs';
import Label from 'modules/common/components/Label';
import Icon from 'modules/common/components/Icon';
import { DateWrapper } from 'modules/common/styles/main';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Tip from 'modules/common/components/Tip';
import { __, formatValue } from 'modules/common/utils';
import { Link } from 'react-router-dom';
import { FlexItem } from 'modules/companies/styles';
import NameCard from 'modules/common/components/nameCard/NameCard';

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

  const { _id, name, status, updatedAt, createdAt } = automation;

  const isActive = status !== 'draft' ? true : false;
  const labelStyle = isActive ? 'success' : 'simple';

  return (
    <tr onClick={onTrClick}>
      <td id="automationsCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td> {name} </td>
      <td>
        <Label lblStyle={labelStyle}>{status}</Label>
      </td>
      <td>
        <FlexItem>
          <NameCard.Avatar customer={{ firstName: 'Anu-Ujin' }} size={30} />
          &emsp;
          {formatValue('Anu-Ujin')}
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
          <Link to={`/automations/details/${_id}`}>
            <Button btnStyle="link">
              <Tip text={__('Edit automation')} placement="top">
                <Icon icon="edit-3" />
              </Tip>
            </Button>
          </Link>
        </ActionButtons>
      </td>
    </tr>
  );
}

export default ActionRow;
