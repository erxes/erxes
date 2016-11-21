import React, { PropTypes } from 'react';
import moment from 'moment';
import Retry from '../containers/Retry';
import User from '../containers/User';
import Attachment from './Attachment.jsx';


const propTypes = {
  error: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
  userId: PropTypes.string,
  sentAt: PropTypes.object.isRequired,
  attachments: PropTypes.array,
};

function Message({ error, message, attachments, _id, userId, sentAt }) {
  let userInfo = '';
  if (userId) {
    userInfo = <User id={userId} />;
  }

  return (
    <li className={!userId ? 'customer' : ''}>
      {userInfo}

      <div className={attachments && attachments.length > 0 ? 'message attachment' : 'message'}>
        {
          message.split('\n').map((line, index) =>
            <span key={index}>{line}<br /></span>
          )
        }
        {
          error
          ? (<div>{error} <Retry message={message} _id={_id} /></div>)
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
