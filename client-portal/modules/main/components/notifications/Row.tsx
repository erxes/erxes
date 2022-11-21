import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';

import { Label } from '../../../common/form/styles';
import { CreatedDate, InfoSection } from '../../../styles/main';
import { INotification } from '../../../types';

type Props = {
  notification: INotification;
  onClickNotification: (notificationId: string) => void;
  //   remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const { notification } = props;
  // const router = useRouter()

  const gotoDetail = () => {
    props.onClickNotification(notification._id);
    // router.push(`/notification/${notification._id}`)

    
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
