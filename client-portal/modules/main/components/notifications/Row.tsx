import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';

import { Label } from '../../../common/form/styles';
import { CreatedDate, InfoSection } from '../../../styles/main';
import { INotification } from '../../../types';
import {useRouter} from 'next/router'

type Props = {
  notification: INotification;
  //   remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const { notification } = props;
  const router = useRouter()

  const gotoDetail = () => {
    router.push(`/notification/${notification._id}`)
  };

  const classes = classNames({ unread: !notification.isRead });
  return (
    <li className={classes} onClick={gotoDetail}>
      <InfoSection>
        <Label>{notification.title || 'New notification'}</Label>
        <CreatedDate>
          {dayjs(notification.createdAt).format('DD MMM YYYY, HH:mm')}
        </CreatedDate>
      </InfoSection>
    </li>
  );
};

export default Row;
