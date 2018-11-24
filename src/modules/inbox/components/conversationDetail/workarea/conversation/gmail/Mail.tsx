import * as juice from 'juice';
import Avatar from 'modules/common/components/nameCard/Avatar';
import { IMessage } from 'modules/inbox/types';
import * as React from 'react';
import sanitizeHtml from 'sanitize-html';
import { Content, EmailItem, Meta, Subject } from './style';

type Props = {
  message: IMessage;
  staff?: boolean;
};

class Mail extends React.Component<Props, {}> {
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

  render() {
    const { message } = this.props;

    // gmail data
    const gmailData = message.gmailData;

    if (!gmailData) {
      return null;
    }

    // all style inlined
    const mailContent = juice(gmailData.textHtml || gmailData.textPlain || '');

    return (
      <EmailItem>
        <Subject>{gmailData.subject}</Subject>
        <Meta>
          <Avatar customer={message.customer} size={32} />
          <div>
            <strong>{gmailData.from}</strong>
            {gmailData.to}
          </div>
        </Meta>
        <Content
          dangerouslySetInnerHTML={{ __html: this.cleanHtml(mailContent) }}
        />
      </EmailItem>
    );
  }
}

export default Mail;
