/* eslint-disable react/no-danger */

import { _ } from 'meteor/underscore';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { Table } from 'react-bootstrap';
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
    'conversation-message-container': true,
    staff,
    internal: message.internal,
    attachment: hasAttachment || isPhotoPost || isVideoPost,
    fbpost: isPhotoPost || isVideoPost,
  });

  const prop = staff ? { user: message.user() } : { customer: message.customer() };

  const renderAvatar = () => {
    if (!isSameUser) {
      return <NameCard.Avatar {...prop} />;
    }

    return null;
  };

  const renderName = () => {
    let fullName = 'Unknown';

    const { user, customer } = prop;

    if (user) {
      fullName = user.details && user.deteails.fullName;
    } else if (customer) {
      fullName = customer.name;
    }

    return fullName;
  };

  const renderIframe = src => {
    const iframeSrc = src;
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
  };

  const renderVideoIframe = () => {
    if (isVideoPost) {
      const iframeSrc = `https://www.facebook.com/video/embed
        ?video_id=${faceboodData.videoId}&width=500`;

      return renderIframe(iframeSrc);
    }

    return null;
  };

  const renderAttachment = () => {
    if (hasAttachment) {
      return <Attachment attachment={message.attachments[0]} />;
    }

    if (isPhotoPost) {
      return renderIframe(
        `https://www.facebook.com/plugins/post.php?
        href=https://www.facebook.com/photo.php?fbid=${faceboodData.photoId}`,
      );
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
    if (message.formWidgetData) {
      return (
        <div className="form-data">
          <Table striped>
            <thead>
              <tr>
                <th className="text-center" colSpan="2">
                  {message.content}
                </th>
              </tr>
            </thead>
            <tbody>
              {_.map(message.formWidgetData, (data, index) => (
                <tr key={index}>
                  <td width="40%">
                    <b>
                      {data.text}:
                    </b>
                  </td>
                  {data.validation === 'date'
                    ? <td width="60%">
                        {moment(data.value).format('YYYY/MM/DD')}
                      </td>
                    : <td width="60%">
                        {data.value}
                      </td>}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    }

    return (
      <div className={classes}>
        {renderAvatar()}
        <div className="body">
          <span dangerouslySetInnerHTML={{ __html: message.content }} />

          {renderVideoIframe()}
          {renderAttachment()}
        </div>
        <footer>
          {moment(message.createdAt).format('YYYY-MM-DD, HH:mm:ss')}
        </footer>
      </div>
    );
  };

  return renderMessage();
}

Message.propTypes = propTypes;

export default Message;
