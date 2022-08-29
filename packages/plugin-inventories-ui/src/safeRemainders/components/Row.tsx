import React from 'react';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
// erxes
import { __ } from '@erxes/ui/src/utils';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import Tip from '@erxes/ui/src/components/Tip';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { renderUserFullName } from '@erxes/ui/src/utils/core';
// local
import { ISafeRemainder } from '../types';

type Props = {
  remainder: ISafeRemainder;
  removeItem: (remainder: ISafeRemainder) => void;
};

export default function Row(props: Props) {
  const { remainder = {} as ISafeRemainder, removeItem } = props;

  // Hooks
  const history = useHistory();

  const {
    date,
    modifiedAt,
    branch,
    department,
    productCategory,
    description,
    status,
    modifiedUser
  } = remainder;

  const handleClick = () => {
    history.push(`/inventories/safe-remainders/details/${remainder._id}`);
  };

  const renderStatus = () => {
    switch (status) {
      case 'new':
        return <Label lblStyle="warning">{__('New')}</Label>;
      case 'draft':
        return <Label lblStyle="warning">{__('Draft')}</Label>;
      default:
        return '';
    }
  };

  return (
    <tr onClick={handleClick}>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>{dayjs(date).format('ll') || 'Created at'}</DateWrapper>
      </td>
      <td>{branch ? branch.title : ''}</td>
      <td>{department ? department.title : ''}</td>
      <td>
        {productCategory
          ? `${productCategory.code} - ${productCategory.name}`
          : ''}
      </td>
      <td>{description}</td>
      <td>{renderStatus()}</td>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>
          {dayjs(modifiedAt).format('ll') || 'Created at'}
        </DateWrapper>
      </td>
      <td>{renderUserFullName(modifiedUser || {})}</td>
      <td onClick={(event: any) => event.stopPropagation()}>
        <ActionButtons>
          <Tip text="Delete" placement="top">
            <Button
              btnStyle="link"
              onClick={() => removeItem(remainder)}
              icon="times-circle"
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
}
