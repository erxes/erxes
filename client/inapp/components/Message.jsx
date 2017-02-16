import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { User, Attachment } from '../components';


const propTypes = {
  content: PropTypes.string.isRequired,
  user: PropTypes.object,
  createdAt: PropTypes.number.isRequired,
  attachments: PropTypes.array,
};

function Message({ content, attachments, user, createdAt }) {
  const itemClasses = classNames({ 'from-customer': !user });
  const messageClasses = classNames('erxes-message', {
    attachment: attachments && attachments.length > 0,
    'from-customer': !user,
  });

  const hasAttachment = attachments && attachments.length > 0;

  return (
    <li className={itemClasses}>
      {user ? <User user={user} /> : null}

      <div className={messageClasses}>
        {hasAttachment ? <Attachment attachment={attachments[0]} /> : null}
        <span dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <div className="date">
        {moment(createdAt).fromNow()}
      </div>
    </li>
  );
}

Message.propTypes = propTypes;

export default Message;
