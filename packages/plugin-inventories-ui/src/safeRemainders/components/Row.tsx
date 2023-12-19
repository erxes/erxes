import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import moment from 'moment';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { ISafeRemainder } from '../types';
import { renderUserFullName } from '@erxes/ui/src/utils/core';
import { useHistory } from 'react-router-dom';

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
        <DateWrapper>
          {moment(date).format('YYYY/MM/DD') || 'Created at'}
        </DateWrapper>
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
          {moment(date).format('YYYY/MM/DD') || 'Created at'}
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
