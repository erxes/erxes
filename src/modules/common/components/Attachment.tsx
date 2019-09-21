import Icon from 'modules/common/components/Icon';
import ImageWithPreview from 'modules/common/components/ImageWithPreview';
import React from 'react';
import styled from 'styled-components';
import { rgba } from '../styles/color';
import colors from '../styles/colors';
import { IAttachment } from '../types';
import { readFile } from '../utils';

const AttachmentWrapper = styled.div`
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  color: ${colors.textPrimary};
  position: relative;

  img {
    max-width: 100%;
  }

  &:hover {
    background: ${rgba(colors.colorCoreDarkBlue, 0.08)};
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  padding: 10px 15px;
  color: ${colors.textPrimary};
  word-wrap: break-word;

  h5 {
    margin: 0 0 5px;
    display: flex;
    font-weight: bold;
  }
`;

const Download = styled.a`
  color: ${colors.colorCoreGray};
  padding: 0 5px;
  margin-left: 5px;

  &:hover {
    color: ${colors.colorCoreBlack};
  }
`;

const PreviewWrapper = styled.div`
  height: 80px;
  width: 110px;
  background: ${rgba(colors.colorCoreDarkBlue, 0.08)};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  overflow: hidden;

  i {
    font-size: 26px;
  }
`;

const Meta = styled.div`
  position: relative;
  font-weight: 500;
  color: ${colors.colorCoreGray};

  > * + * {
    margin-left: 10px;
  }
`;

type Props = {
  attachment: IAttachment;
  scrollBottom?: () => void;
  additionalItem?: React.ReactNode;
};

class Attachment extends React.Component<Props> {
  renderOtherInfo = attachment => {
    const name = attachment.name || attachment.url || '';

    return (
      <>
        <h5>
          {name}
          <Download
            rel="noopener noreferrer"
            href={readFile(attachment.url)}
            target="_blank"
          >
            <Icon icon="download-1" />
          </Download>
        </h5>
        <Meta>
          {attachment.size && (
            <span>Size: {Math.round(attachment.size / 1000)}kB</span>
          )}
          {this.props.additionalItem}
        </Meta>
      </>
    );
  };

  renderOtherFile = (attachment, icon) => {
    return (
      <AttachmentWrapper>
        <PreviewWrapper>
          <Icon icon={icon} />
        </PreviewWrapper>
        <ItemInfo>{this.renderOtherInfo(attachment)}</ItemInfo>
      </AttachmentWrapper>
    );
  };

  onLoadImage = () => {
    const { scrollBottom } = this.props;

    if (scrollBottom) {
      scrollBottom();
    }
  };

  renderAtachment = ({ attachment }) => {
    if (!attachment.type) {
      return null;
    }

    if (attachment.type.startsWith('image')) {
      return (
        <AttachmentWrapper>
          <PreviewWrapper>
            <ImageWithPreview
              onLoad={this.onLoadImage}
              alt={attachment.url}
              src={attachment.url}
            />
          </PreviewWrapper>
          <ItemInfo>{this.renderOtherInfo(attachment)}</ItemInfo>
        </AttachmentWrapper>
      );
    }

    const url = attachment.url || attachment.name || '';
    const fileExtension = url.split('.').pop();

    let filePreview;

    switch (fileExtension) {
      case 'png':
      case 'jpeg':
      case 'doc':
      case 'docx':
      case 'txt':
      case 'pdf':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
        filePreview = this.renderOtherFile(attachment, 'file');
        break;
      case 'mp4':
      case 'avi':
        filePreview = this.renderOtherFile(attachment, 'videocamera');
        break;
      case 'mp3':
      case 'wav':
        filePreview = this.renderOtherFile(attachment, 'music');
        break;
      case 'zip':
        filePreview = this.renderOtherFile(attachment, 'cube');
        break;
      default:
        filePreview = this.renderOtherFile(attachment, 'clipboard-1');
    }
    return filePreview;
  };

  render() {
    const props = this.props;

    return this.renderAtachment(props);
  }
}

export default Attachment;
