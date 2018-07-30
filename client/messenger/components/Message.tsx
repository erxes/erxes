import * as React from 'react';
import * as moment from 'moment';
import * as classNames from 'classnames';
import { User, Attachment } from '../components';
import { IUser, IAttachment } from '../types';

type Props = {
  content: string,
  createdAt: Date,
  attachments: IAttachment[],
  user?: IUser,
  color?: string,
};

function Message({ content, attachments, user, createdAt, color }: Props) {
  const itemClasses = classNames({ 'from-customer': !user });
  const messageClasses = classNames('erxes-message', {
    attachment: attachments && attachments.length > 0,
    'from-customer': !user,
  });

  const hasAttachment = attachments && attachments.length > 0;

  const messageBackground = {
    backgroundColor: !user ? color : '',
  };

  return (
    <li className={itemClasses}>
      {user ? <User user={user} /> : null}

      <div style={messageBackground} className={messageClasses}>
        {hasAttachment ? <Attachment attachment={attachments[0]} /> : null}
        <span dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <div className="date">
        <span className="erxes-tooltip" data-tooltip={moment(createdAt).format('YYYY-MM-DD, HH:mm:ss')}>
          {moment(createdAt).format('LT')}
        </span>
      </div>
    </li>
  );
}

export default Message;
