import juice from 'juice';
import Button from 'modules/common/components/Button';
import { IMessage } from 'modules/inbox/types';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import React from 'react';
import sanitizeHtml from 'sanitize-html';
import Attachments from './Attachments';
import MailHeader from './MailHeader';
import { BoxItem, Content, Reply } from './style';

type Props = {
  message: IMessage;
  integrationId: string;
  conversationId?: string;
  kind: string;
  isLast: boolean;
  brandId?: string;
};

type State = {
  isReply: boolean;
  toAll: boolean;
  isCollapsed: boolean;
};

class Mail extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isReply: false,
      toAll: false,
      isCollapsed: !props.isLast
    };
  }

  onToggleContent = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  toggleReply = (_, toAll: boolean = false) => {
    this.setState({ isReply: !this.state.isReply, toAll });
  };

  closeReply = () => {
    this.setState({ isReply: false });
  };

  cleanHtml(mailContent: string) {
    return sanitizeHtml(mailContent, {
      allowedTags: false,
      allowedAttributes: false,
      transformTags: {
        html: 'div',
        body: 'div'
      },

      // remove some unusual tags
      exclusiveFilter: n => {
        return n.tag === 'meta' || n.tag === 'head' || n.tag === 'style';
      }
    });
  }

  renderReplyButton() {
    if (
      this.state.isReply ||
      !this.props.isLast ||
      typeof this.props.message._id !== 'string'
    ) {
      return null;
    }

    const toggleReplyAll = e => this.toggleReply(e, true);

    return (
      <Reply>
        <Button
          icon="corner-up-left-alt"
          size="small"
          onClick={this.toggleReply}
          btnStyle="primary"
        >
          Reply
        </Button>
        <Button
          icon="corner-up-left-alt"
          size="small"
          onClick={toggleReplyAll}
          btnStyle="primary"
        >
          Reply to all
        </Button>
      </Reply>
    );
  }

  renderMailForm(mailData) {
    const { toAll, isReply } = this.state;

    if (!isReply) {
      return null;
    }

    const { conversationId, integrationId, brandId } = this.props;

    return (
      <BoxItem>
        <MailForm
          toAll={toAll}
          isReply={isReply}
          closeReply={this.closeReply}
          conversationId={conversationId}
          toggleReply={this.toggleReply}
          integrationId={integrationId}
          refetchQueries={['detailQuery']}
          mailData={mailData}
          brandId={brandId}
        />
      </BoxItem>
    );
  }

  renderMailBody(mailData) {
    if (this.state.isCollapsed) {
      return null;
    }

    // all style inlined
    const mailContent = juice(mailData.body || '');

    const innerHTML = { __html: this.cleanHtml(mailContent) };

    return (
      <>
        <Content dangerouslySetInnerHTML={innerHTML} />
        {this.renderAttachments(mailData)}
        {this.renderReplyButton()}
      </>
    );
  }

  renderAttachments(mailData) {
    const { messageId, attachments = [] } = mailData;

    if (!attachments || attachments.length === 0) {
      return;
    }

    const { kind, integrationId } = this.props;

    return (
      <Attachments
        kind={kind}
        integrationId={integrationId}
        attachments={attachments}
        messageId={messageId}
      />
    );
  }

  render() {
    const { message = {} as IMessage } = this.props;

    if (!message) {
      return null;
    }

    const { mailData } = message;

    if (!mailData) {
      return null;
    }

    return (
      <>
        <BoxItem toggle={this.state.isCollapsed}>
          <MailHeader
            message={message}
            isContentCollapsed={this.state.isCollapsed}
            onToggleContent={this.onToggleContent}
            onToggleReply={this.toggleReply}
          />
          {this.renderMailBody(mailData)}
        </BoxItem>
        {this.renderMailForm(mailData)}
      </>
    );
  }
}

export default Mail;
