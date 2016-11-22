import React, { PropTypes } from 'react';
import moment from 'moment';
import Retry from '../containers/Retry';
import User from '../containers/User';
import Attachment from './Attachment.jsx';


const propTypes = {
  error: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  userId: PropTypes.string,
  sentAt: PropTypes.object.isRequired,
  attachments: PropTypes.array,
};

function Message({ error, message, attachments, userId, sentAt }) {
  return (
    <li className={!userId ? 'customer' : ''}>
      {userId ? <User id={userId} /> : null}

      <div className={attachments && attachments.length > 0 ? 'message attachment' : 'message'}>
        {
          message.split('\n').map((line, index) =>
            <span key={index}>{line}<br /></span>
          )
        }
        {
          error
          ? (<div>{error} <Retry message={message} /></div>)
          : ''
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
