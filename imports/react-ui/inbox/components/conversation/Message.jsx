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
  const faceboodData = message.facebookData;
  const isReaction = faceboodData && faceboodData.item === 'reaction';
  const isPhotoPost = faceboodData && faceboodData.item === 'photo';
  const isVideoPost = faceboodData && faceboodData.item === 'video' && faceboodData.videoId;
  const hasAttachment = message.attachments && message.attachments.length > 0;
  const classes = classNames({
    message: true,
    staff,
    internal: message.internal,
    attachment: hasAttachment || isPhotoPost || isVideoPost,
    fbpost: isPhotoPost || isVideoPost,
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

  const renderVideoIframe = () => {
    if (isVideoPost) {
      const iframeSrc = `https://www.facebook.com/video/embed?video_id=${faceboodData.videoId}&width=500`;
      return (
        <iframe
          src={iframeSrc}
          width="480"
          height="280"
          scrolling="no"
          frameBorder="0"
          allowTransparency="true"
        />
      );
    }
    return null;
  };

  const renderAttachment = () => {
    if (hasAttachment) {
      return <Attachment path={message.attachments[0].url} type={message.attachments[0].type} />;
    } else if (isPhotoPost) {
      const iframeSrc = `https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/photo.php?fbid=${faceboodData.photoId}`;
      return (
        <iframe
          src={iframeSrc}
          width="480"
          height="280"
          scrolling="no"
          frameBorder="0"
          allowTransparency="true"
        />)
      ;
    }
    return null;
  };

  const renderMessage = () => {
    if (isReaction) {
      const reactingClass = `reaction-${faceboodData.reactionType}`;
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
          {renderVideoIframe()}
          {renderAttachment()}
          <footer>
            {moment(message.createdAt).fromNow()}
          </footer>
        </div>
      </div>
    );
  };

  return renderMessage();
}

Message.propTypes = propTypes;

export default Message;
