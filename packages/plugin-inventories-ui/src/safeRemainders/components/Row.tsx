import React from 'react';
import dayjs from 'dayjs';
import { __, ActionButtons, Button, Icon, Label, Tip } from '@erxes/ui/src';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { renderUserFullName } from '@erxes/ui/src/utils/core';
import { ISafeRemainder } from '../types';

type Props = {
  remainder: ISafeRemainder;
  history: any;
  removeRemainder: (remainder: ISafeRemainder) => void;
};

const Row = (props: Props) => {
  const { remainder, history, removeRemainder } = props;

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
              onClick={() => removeRemainder(remainder)}
              icon="times-circle"
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
