import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import Label from '@erxes/ui/src/components/Label';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import React from 'react';
import { EMAIL_TYPES } from '../containers/EmailDelivery';
import { STATUS_OPTIONS } from './EmailDelivery';
import { RowWrapper, TableCell } from '../../logs/styles';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  item: any;
  emailType: string;
};

export default function Row(props: Props) {
  const { emailType, item } = props;

  const [showMore, setShowMore] = React.useState<boolean>(false);

  if (!emailType) {
    return null;
  }

  const renderStatus = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);

    return <Label lblColor={option && option.color}>{status || '-'}</Label>;
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const getMails = mails => {
    if (mails && mails.length > 0) {
      if (mails.length === 1) {
        return (
          <TableCell>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {mails.map(mail => (
                <li key={mail}>{mail}</li>
              ))}
            </ul>
          </TableCell>
        );
      }
      return (
        <TableCell showMore={showMore} onClick={toggleShowMore}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {mails.map(mail => (
              <li key={mail}>{mail}</li>
            ))}
          </ul>

          <Tip text={showMore ? 'Show less' : 'Show more'} placement="top">
            <span onClick={toggleShowMore}>
              <Icon icon={showMore ? 'angle-up' : 'angle-down'} />
            </span>
          </Tip>
        </TableCell>
      );
    }

    return <TableCell>{'-'}</TableCell>;
  };

  if (emailType === EMAIL_TYPES.TRANSACTION) {
    return (
      <RowWrapper key={item._id}>
        <td>{item.subject || '-'}</td>
        {getMails(item.to)}
        {getMails(item.cc)}
        {getMails(item.bcc)}
        <td>{item.from || '-'}</td>
        <td>
          <Label lblStyle="primary">{item.status || '-'}</Label>
        </td>
        <td>
          <DateWrapper>
            {dayjs(item.createdAt).format('LLL') || '-'}
          </DateWrapper>
        </td>
      </RowWrapper>
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
      <td>{item.email || '-'}</td>
      <td>{title || '-'}</td>
      <td>{renderStatus(item.status) || '-'}</td>
      <td>
        <DateWrapper>
          {item.createdAt ? dayjs(item.createdAt).format('LLL') : '-'}
        </DateWrapper>
      </td>
    </tr>
  );
}
