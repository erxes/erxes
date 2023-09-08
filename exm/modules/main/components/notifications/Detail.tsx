import dayjs from 'dayjs';
import React from 'react';

import Button from '../../../common/Button';
import { FormGroup } from '../../../common/form';
import { CreatedDate, FormWrapper } from '../../../styles/main';
import { INotification } from '../../../types';

type Props = {
  notification: INotification;
  removeNotification: (_id: string) => void;
};

export default function Detail({ removeNotification, notification }: Props) {
  const handleClick = () => {
    removeNotification(notification._id);
  };

  return (
    <FormWrapper>
      <h4>{notification.title || 'Notification'}</h4>
      <div className="content">
        <FormGroup>
          <div dangerouslySetInnerHTML={{ __html: notification.content }} />

          <CreatedDate>
            {dayjs(notification.createdAt).format('DD MMM YYYY, HH:mm')}
          </CreatedDate>
        </FormGroup>

        <div className="left">
          <Button
            btnStyle="danger"
            onClick={handleClick}
            uppercase={false}
            icon="check-circle"
          >
            Delete
          </Button>
        </div>
      </div>
    </FormWrapper>
  );
}
