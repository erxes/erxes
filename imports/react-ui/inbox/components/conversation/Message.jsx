import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { NameCard, Attachment, Tip } from '/imports/react-ui/common';


const propTypes = {
  message: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  isSameUser: PropTypes.bool,
};

function Message({ message, staff, isSameUser }) {
  const isReaction = message.facebookData && message.facebookData.item === 'reaction';
  const hasAttachment = message.attachments && message.attachments.length > 0;
  const classes = classNames({
    message: true,
    staff,
    internal: !!message.internal,
    attachment: !!hasAttachment,
  });

  const prop = staff
    ? { user: message.user() }
    : { customer: message.customer() };

  const renderAvatar = () => {
    if (!isSameUser) {
      return <NameCard.Avatar {...prop} />;
    }

    return null;
  };

  const renderName = () => {
    let fullName = 'Unknown';
    if (prop.user) {
      fullName = prop.user.deteails && prop.user.deteails.fullName;
    } else if (prop.customer) {
      fullName = prop.customer.name;
    }
    return fullName;
  };

  const renderMessage = () => {
    if (isReaction) {
      const reactingClass = `reaction-${message.facebookData.reactionType}`;
      return (
        <Tip text={renderName()}>
          <div className="reaction">
            <span className={reactingClass} />
          </div>
        </Tip>
      );
    }

    return (
      <div className={classes}>
        {renderAvatar()}
        <div className="body">
          {
            message.content.split('\n').map((line, index) =>
              <span key={index}>{line}<br /></span>,
            )
          }
          {
            hasAttachment ?
              <Attachment
                path={message.attachments[0].url}
                type={message.attachments[0].type}
              /> : null
          }
          <footer>
            {moment(message.createdAt).fromNow()}
          </footer>
        </div>
      </div>
    );
  };

  return (
    renderMessage()
  );
}

Message.propTypes = propTypes;

export default Message;
