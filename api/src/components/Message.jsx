import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { Retry, User } from '../containers';
import { Attachment } from '../components';


const propTypes = {
  error: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  userId: PropTypes.string,
  sentAt: PropTypes.object.isRequired,
  attachments: PropTypes.array,
};

function Message({ error, message, attachments, userId, sentAt }) {
  const itemClasses = classNames({ 'from-customer': !userId });
  const messageClasses = classNames('message', {
    attachment: attachments && attachments.length > 0,
    'from-customer': !userId,
  });

  return (
    <li className={itemClasses}>
      {userId ? <User id={userId} /> : null}

      <div className={messageClasses}>
        {
          message.split('\n').map((line, index) =>
            <span key={index}>{line}<br /></span>
          )
        }
        {
          error ? <div>{error} <Retry message={message} /></div> : ''
        }
        {
          attachments && attachments.length > 0 ?
            <Attachment path={attachments[0].url} /> :
            null
        }
      </div>
      <div className="date">
        {moment(sentAt).fromNow()}
      </div>
    </li>
  );
}

Message.propTypes = propTypes;

export default Message;
