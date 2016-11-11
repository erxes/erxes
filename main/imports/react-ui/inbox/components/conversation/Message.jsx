import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { NameCard, Attachment } from '/imports/react-ui/common';


const propTypes = {
  message: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  isSameUser: PropTypes.bool,
};

function Message({ message, staff, isSameUser }) {
  const classes = classNames({
    message: true,
    staff,
    internal: !!message.internal,
    attachment: !!message.attachments && message.attachments.length > 0,
  });

  const prop = staff
    ? { user: message.user() }
    : { customer: message.customer() };
  return (
    <div className={classes}>
      {isSameUser ?
        null :
        <NameCard.Avatar
          {...prop}
        />
      }
      <div className="body">
        {
          message.content.split('\n').map((line, index) =>
            <span key={index}>{line}<br /></span>
          )
        }
        {
          message.attachments && message.attachments.length > 0 ?
            <Attachment path={message.attachments[0].url} /> :
            null
        }
      </div>
      <footer>
        {moment(message.createdAt).fromNow()}
      </footer>
    </div>
  );
}

Message.propTypes = propTypes;

export default Message;
