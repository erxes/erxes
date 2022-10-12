import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import Label from '@erxes/ui/src/components/Label';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import React from 'react';
import { EMAIL_TYPES } from '../containers/EmailDelivery';
import { STATUS_OPTIONS } from './EmailDelivery';

type Props = {
  item: any;
  emailType: string;
};

export default function Row(props: Props) {
  const { emailType, item } = props;

  if (!emailType) {
    return null;
  }

  const renderStatus = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);

    return <Label lblColor={option && option.color}>{status || '-'}</Label>;
  };

  if (emailType === EMAIL_TYPES.TRANSACTION) {
    return (
      <tr key={item._id}>
        <td>{item.subject || '-'}</td>
        <td>{item.to || '-'}</td>
        <td>{item.cc || '-'}</td>
        <td>{item.bcc || '-'}</td>
        <td>{item.from || '-'}</td>
        <td>
          <Label lblStyle="primary">{item.status || '-'}</Label>
        </td>
        <td>
          <DateWrapper>
            {dayjs(item.createdAt).format('LLL') || '-'}
          </DateWrapper>
        </td>
      </tr>
    );
  }

  let title: any = <span>-</span>;

  if (item.engage) {
    title = (
      <Link to={`/campaigns/show/${item.engage._id}`} target="_blank">
        {item.engage.title}
      </Link>
    );
  }

  return (
    <tr key={item._id}>
      <td>{item.customerName || item.customerId || '-'}</td>
      <td>{item.email}</td>
      <td>{title}</td>
      <td>{renderStatus(item.status)}</td>
      <td>
        <DateWrapper>
          {item.createdAt ? dayjs(item.createdAt).format('LLL') : '-'}
        </DateWrapper>
      </td>
    </tr>
  );
}
