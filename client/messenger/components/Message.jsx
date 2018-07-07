import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { User, Attachment } from '../components';

const propTypes = {
  content: PropTypes.string.isRequired,
  user: PropTypes.object,
  createdAt: PropTypes.number.isRequired,
  attachments: PropTypes.array,
  color: PropTypes.string,
};

function Message({ content, attachments, user, createdAt, color }) {
  const itemClasses = classNames({ 'from-customer': !user });
  const messageClasses = classNames('erxes-message', {
    attachment: attachments && attachments.length > 0,
    'from-customer': !user,
  });

  const hasAttachment = attachments && attachments.length > 0;

  const messageBackground = {
    backgroundColor: !user ? color : null,
  };

  return (
    <li className={itemClasses}>
      {user ? <User user={user} /> : null}

      <div style={messageBackground} className={messageClasses}>
        {hasAttachment ? <Attachment attachment={attachments[0]} /> : null}
        <span dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <div className="date erxes-tooltip" data-tooltip={moment(createdAt).format('YYYY-MM-DD, HH:mm:ss')}>
        {moment(createdAt).format('LT')}
      </div>
    </li>
  );
}

Message.propTypes = propTypes;

Message.defaultProps = {
  user: null,
  color: null,
  attachments: [],
};

export default Message;
