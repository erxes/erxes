import classNames from "classnames";
import { Attachment } from "modules/common/components";
import React, { Fragment } from "react";
import { IMessageDocument } from "../../../../../types";
import { SimpleMessage } from "./";

type Props = {
  message: IMessageDocument;
};

export default class FacebookMessage extends React.Component<Props, {}> {
  renderIframe(src) {
    return (
      <iframe
        title="erxesIframe"
        src={src}
        width="480"
        height="280"
        scrolling="no"
        frameBorder="0"
      />
    );
  }

  renderAttachment(message, hasAttachment, isPhotoPost) {
    const { facebookData } = message;

    if (hasAttachment) {
      return <Attachment attachment={message.attachments[0]} />;
    }

    if (isPhotoPost) {
      return this.renderIframe(
        `https://www.facebook.com/plugins/post.php?
        href=https://www.facebook.com/photo.php?fbid=${facebookData.photoId}`
      );
    }

    return null;
  }

  renderVideoIframe(fbData, isVideoPost) {
    if (!isVideoPost) {
      return null;
    }

    return this.renderIframe(
      `https://www.facebook.com/video/embed?video_id=${
        fbData.videoId
      }&width=500`
    );
  }

  render() {
    const { message } = this.props;
    const fbData = message.facebookData;

    if (!fbData) {
      return null;
    }

    const isPhotoPost = fbData.item === "photo";
    const isVideoPost = fbData.item === "video" && fbData.video;
    const hasAttachment = message.attachments && message.attachments.length > 0;

    const classes = classNames({
      attachment: hasAttachment || isPhotoPost || isVideoPost,
      fbpost: isPhotoPost || isVideoPost
    });

    const renderContent = () => {
      return (
        <Fragment>
          <span dangerouslySetInnerHTML={{ __html: message.content }} />
          {this.renderVideoIframe(fbData, isVideoPost)}
          {this.renderAttachment(message, hasAttachment, isPhotoPost)}
        </Fragment>
      );
    };

    return (
      <SimpleMessage
        {...this.props}
        classes={classes}
        renderContent={renderContent}
        isStaff={!message.customerId}
      />
    );
  }
}
