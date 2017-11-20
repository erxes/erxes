import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { TextDivider, Spinner } from 'modules/common/components';
import Message from './Message';

const propTypes = {
  conversation: PropTypes.object,
  attachmentPreview: PropTypes.object,
  scrollBottom: PropTypes.func
};

const Wrapper = styled.div`
  padding: 20px;
  overflow: hidden;

  > div:first-child {
    margin-top: 0;
  }
`;

const Preview = styled.div`
  max-width: 360px;
  padding: 10px;
  background: ${colors.colorSecondary};
  margin-left: auto;
  margin-right: 55px;
  display: inline-block;
  float: right;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  border-radius: 7px;
  position: relative;

  > div {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -12px;
    margin-top: -12px;
  }

  img {
    max-width: 100%;
    opacity: 0.7;
  }
`;

const File = styled.span`
  width: 80px;
  height: 50px;
  display: block;
`;

class Conversation extends Component {
  constructor(props) {
    super(props);

    this.renderPreview = this.renderPreview.bind(this);
  }

  renderPreview() {
    const { attachmentPreview } = this.props;

    if (attachmentPreview && attachmentPreview.data) {
      return (
        <Preview>
          {attachmentPreview.type.startsWith('image') ? (
            <img alt={attachmentPreview.name} src={attachmentPreview.data} />
          ) : (
            <File />
          )}
          <Spinner />
        </Preview>
      );
    }

    return null;
  }

  render() {
    const { conversation, scrollBottom } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversation.messages || [];
    const rows = [];

    let tempId;

    messages.forEach(message => {
      if (message.info) {
        rows.push(<TextDivider key={message._id} text={message.content} />);
      } else {
        rows.push(
          <Message
            isSameUser={
              message.userId
                ? message.userId === tempId
                : message.customerId === tempId
            }
            message={message}
            staff={!message.customerId}
            key={message._id}
            scrollBottom={scrollBottom}
          />
        );

        tempId = message.userId ? message.userId : message.customerId;
      }
    });

    return (
      <Wrapper>
        {rows}
        {this.renderPreview()}
      </Wrapper>
    );
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
