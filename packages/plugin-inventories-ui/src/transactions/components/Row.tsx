import React from 'react';
import dayjs from 'dayjs';
import {
  __,
  ActionButtons,
  Button,
  Tip,
  Icon,
  ModalTrigger,
  Label
} from '@erxes/ui/src';
import { DateWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  data: any;
};

const Row = (props: Props) => {
  const { data } = props;

  const renderStatus = () => {
    switch (data && data.status) {
      case 'checked':
        return <Label lblStyle="success">{__('Checked')}</Label>;
      case 'draft':
        return <Label lblStyle="warning">{__('Draft')}</Label>;
      default:
        return '';
    }
  };

  return (
    <tr>
      <td>{((data && data.branchDetail) || {}).title || 'Branch'}</td>
      <td>{((data && data.departmentDetail) || {}).title || 'Department'}</td>
      <td>{data && data.contentType}</td>
      <td>{renderStatus()}</td>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>
          {dayjs(data.createdAt).format('ll') || 'Created at'}
        </DateWrapper>
      </td>
      <td>
        <b>{data && data.createdUser ? data.createdUser.username : ''}</b>
      </td>
    </tr>
  );
};

export default Row;
