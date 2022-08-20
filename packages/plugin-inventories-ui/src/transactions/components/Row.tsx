import React from 'react';
import dayjs from 'dayjs';
import { Icon } from '@erxes/ui/src';
import { DateWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  data: any;
};

const Row = (props: Props) => {
  const { data } = props;

  return (
    <tr>
      <td>{((data && data.branchDetail) || {}).title || 'Branch'}</td>
      <td>{((data && data.departmentDetail) || {}).title || 'Department'}</td>
      <td>{data && data.contentType}</td>
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
