import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __, getEnv } from '@erxes/ui/src/utils';
import * as React from 'react';
import { IMailAttachment } from '../../../../types';
import {
  AttachmentItem,
  AttachmentsContainer,
  Download,
  FileInfo,
  FileName
} from './style';

type Props = {
  attachments: IMailAttachment[];
  integrationId: string;
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

  getIcon(type: string) {
    if (type.startsWith('image')) {
      return <Icon icon="image-v" size={14} />;
    }

    return <Icon icon="file-alt" size={14} />;
  }

  createLink(attachmentId: string, filename: string, type?: string) {
    const { REACT_APP_API_URL } = getEnv();
    const { messageId, integrationId } = this.props;

    return `${REACT_APP_API_URL}/pl:imap/read-mail-attachment?messageId=${messageId}&attachmentId=${attachmentId}&integrationId=${integrationId}&filename=${filename}&contentType=${type}`;
  }

  renderAttach(attachment: IMailAttachment) {
    const {
      id,
      size,
      attachmentId,
      content_type,
      mimeType = '',
      filename = ''
    } = attachment;
    const type = mimeType ? mimeType : content_type;

    return (
      <AttachmentItem key={id}>
        {this.getIcon(type || '')}
        <FileName>{filename}</FileName>

        <FileInfo>
          <span>{this.formatSize(size)}</span>
          <Tip text={__('Download')} placement="top">
            <Download
              href={this.createLink(id || attachmentId, filename, type)}
              target="_blank"
            >
              <Icon icon="arrow-down" />
            </Download>
          </Tip>
        </FileInfo>
      </AttachmentItem>
    );
  }

  render() {
    const { attachments } = this.props;

    if (!attachments || attachments.length === 0) {
      return;
    }

    return (
      <AttachmentsContainer>
        {attachments.map(attach => this.renderAttach(attach))}
      </AttachmentsContainer>
    );
  }
}

export default Attachments;
