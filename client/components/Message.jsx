import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { User } from '../containers';
import { Attachment } from '../components';


const propTypes = {
  content: PropTypes.string.isRequired,
  userId: PropTypes.string,
  createdAt: PropTypes.number.isRequired,
  attachments: PropTypes.array,
};

function Message({ content, attachments, userId, createdAt }) {
  const itemClasses = classNames({ 'from-customer': !userId });
  const messageClasses = classNames('erxes-message', {
    attachment: attachments && attachments.length > 0,
    'from-customer': !userId,
  });

  const hasAttachment = attachments && attachments.length > 0;

  return (
    <li className={itemClasses}>
      {userId ? <User id={userId} /> : null}

      <div className={messageClasses}>
        {hasAttachment ? <Attachment path={attachments[0].url} /> : null}
        {
          !hasAttachment ? content.split('\n').map((line, index) =>
            <span key={index}>{line}<br /></span>
          ) : null
        }
      </div>
      <div className="date">
        {moment(createdAt).fromNow()}
      </div>
    </li>
  );
}

Message.propTypes = propTypes;

export default Message;
