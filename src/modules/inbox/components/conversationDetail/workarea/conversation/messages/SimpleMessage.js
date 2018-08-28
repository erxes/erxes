import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { NameCard, Tip, Attachment } from 'modules/common/components';
import { MessageItem, MessageBody, MessageContent } from '../styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  classes: PropTypes.string,
  isStaff: PropTypes.bool,
  isSameUser: PropTypes.bool,
  renderContent: PropTypes.func
};

export default class SimpleMessage extends React.Component {
  renderAvatar() {
    const { message, isSameUser } = this.props;

    if (isSameUser) {
      return null;
    }

    const user = message.user || {};
    const customer = message.customer || {};
    const props = user._id ? { user } : { customer };

    return <NameCard.Avatar {...props} />;
  }

  renderAttachment(hasAttachment) {
    const { message } = this.props;

    if (!hasAttachment) {
      return null;
    }

    return <Attachment attachment={message.attachments[0]} />;
  }

  renderContent(hasAttachment) {
    const { message, renderContent } = this.props;

    if (renderContent) {
      return renderContent();
    }

    return (
      <Fragment>
        <span dangerouslySetInnerHTML={{ __html: message.content }} />
        {this.renderAttachment(hasAttachment)}
      </Fragment>
    );
  }

  render() {
    const { message, isStaff, isSameUser } = this.props;
    const messageDate = message.createdAt;
    const hasAttachment = message.attachments && message.attachments.length > 0;

    const classes = classNames({
      ...(this.props.classes || {}),
      attachment: hasAttachment,
      same: isSameUser
    });

    return (
      <MessageItem staff={isStaff} className={classes} isSame={isSameUser}>
        {this.renderAvatar()}

        <MessageBody staff={isStaff}>
          <MessageContent staff={isStaff} internal={message.internal}>
            {this.renderContent(hasAttachment)}
          </MessageContent>
          <Tip text={moment(messageDate).format('lll')}>
            <footer>{moment(messageDate).format('LT')}</footer>
          </Tip>
        </MessageBody>
      </MessageItem>
    );
  }
}

SimpleMessage.propTypes = propTypes;
