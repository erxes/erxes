import { getEnv } from 'apolloClient';
import { Icon, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IGmailAttachment } from 'modules/inbox/types';
import * as React from 'react';
import {
  AttachmentItem,
  AttachmentsContainer,
  Download,
  FileIcon,
  FileInfo,
  FileName
} from './style';

type Props = {
  attachments: IGmailAttachment[];
  messageId: string;
};

const units = ['B', 'KB', 'MB', 'GB'];

class Attachments extends React.PureComponent<Props, {}> {
  formatSize(size) {
    let l = 0;
    let n = parseInt(size, 10) || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return `${n.toFixed(n >= 10 || l < 1 ? 0 : 1)}  ${units[l]}`;
  }

  getIcon(type: string, size: number) {
    if (type.startsWith('image')) {
      return <Icon icon="picture" size={size} />;
    }

    return <Icon icon="doc-inv" size={size} />;
  }

  createLink(attachmentId: string) {
    const { REACT_APP_API_URL } = getEnv();
    const { messageId } = this.props;

    return `${REACT_APP_API_URL}/read-gmail-attachment?message=${messageId}&attach=${attachmentId}`;
  }

  renderAttach(attachment: IGmailAttachment) {
    const type = attachment.mimeType || '';

    return (
      <AttachmentItem key={attachment.filename}>
        <FileIcon>{this.getIcon(type, 32)}</FileIcon>
        <FileInfo>
          {this.getIcon(type, 14)}
          <FileName>{attachment.filename}</FileName>
          <span>{this.formatSize(attachment.size)}</span>
          <Tip text={__('Download')}>
            <Download
              href={this.createLink(attachment.attachmentId)}
              target="_blank"
            >
              <Icon icon="download" />
            </Download>
          </Tip>
        </FileInfo>
      </AttachmentItem>
    );
  }

  render() {
    const { attachments } = this.props;

    return (
      <AttachmentsContainer>
        {attachments.map(attach => {
          return this.renderAttach(attach);
        })}
      </AttachmentsContainer>
    );
  }
}

export default Attachments;
