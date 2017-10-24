/* eslint-disable react/no-danger */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { Table } from 'react-bootstrap';
import { NameCard } from 'modules/common/components';
import { MessageItem, MessageBody, FormTable } from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  isSameUser: PropTypes.bool
};

function Message({ message, staff, isSameUser }) {
  const user = message.user || {};
  const customer = message.customer || {};
  const faceboodData = message.facebookData;
  const isPhotoPost = faceboodData && faceboodData.item === 'photo';
  const isVideoPost =
    faceboodData && faceboodData.item === 'video' && faceboodData.videoId;
  const hasAttachment = message.attachments && message.attachments.length > 0;

  // TODO: remove classes after test attachment and facebook post
  const classes = classNames({
    attachment: hasAttachment || isPhotoPost || isVideoPost,
    fbpost: isPhotoPost || isVideoPost
  });

  const prop = staff ? { user } : { customer };

  const renderAvatar = () => {
    if (!isSameUser) {
      return <NameCard.Avatar {...prop} />;
    }

    return null;
  };

  const renderIframe = src => {
    const iframeSrc = src;
    return (
      <iframe
        title="erxesIframe"
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
      // TODO: render Attachment
      return null;
    }

    if (isPhotoPost) {
      return renderIframe(
        `https://www.facebook.com/plugins/post.php?
        href=https://www.facebook.com/photo.php?fbid=${faceboodData.photoId}`
      );
    }

    return null;
  };

  const renderMessage = () => {
    if (message.formWidgetData) {
      return (
        <FormTable>
          <Table striped>
            <thead>
              <tr>
                <th className="text-center" colSpan="2">
                  {message.content}
                </th>
              </tr>
            </thead>
            <tbody>
              {message.formWidgetData.map((data, index) => (
                <tr key={index}>
                  <td width="40%">
                    <b>{data.text}:</b>
                  </td>
                  {data.validation === 'date' ? (
                    <td width="60%">
                      {moment(data.value).format('YYYY/MM/DD')}
                    </td>
                  ) : (
                    <td width="60%">{data.value}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </FormTable>
      );
    }

    return (
      <MessageItem staff={staff} className={classes}>
        {renderAvatar()}
        <MessageBody staff={staff} internal={message.internal}>
          <span dangerouslySetInnerHTML={{ __html: message.content }} />

          {renderVideoIframe()}
          {renderAttachment()}
        </MessageBody>
      </MessageItem>
    );
  };

  return renderMessage();
}

Message.propTypes = propTypes;

export default Message;
