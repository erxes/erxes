import Icon from 'modules/common/components/Icon';
import ImageWithPreview from 'modules/common/components/ImageWithPreview';
import React from 'react';
import styled from 'styled-components';
import { rgba } from '../styles/color';
import colors from '../styles/colors';
import { IAttachment } from '../types';
import { __, readFile } from '../utils';

export const AttachmentWrapper = styled.div`
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
  word-wrap: break-word;

  h5 {
    margin: 0 0 5px;
    font-weight: bold;
  }

  video {
    width: 100%;
  }
`;

const Download = styled.a`
  color: ${colors.colorCoreGray};
  margin-left: 10px;

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
  align-self: center;

  i {
    font-size: 36px;
    color: ${colors.colorSecondary};
  }
`;

export const Meta = styled.div`
  position: relative;
  font-weight: 500;
  color: ${colors.colorCoreGray};

  > * + * {
    margin-left: 10px;
  }
`;

const AttachmentName = styled.span`
  word-wrap: break-word;
  word-break: break-word;
  line-height: 20px;
`;

type Props = {
  attachment: IAttachment;
  scrollBottom?: () => void;
  additionalItem?: React.ReactNode;
  simple?: boolean;
};

class Attachment extends React.Component<Props> {
  renderOtherInfo = attachment => {
    const name = attachment.name || attachment.url || '';

    return (
      <>
        <h5>
          <AttachmentName>{name}</AttachmentName>
          <Download
            rel="noopener noreferrer"
            href={readFile(attachment.url)}
            target="_blank"
          >
            <Icon icon="external-link-alt" />
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

  renderVideoFile = attachment => {
    return (
      <AttachmentWrapper>
        <ItemInfo>
          <video controls={true} loop={true}>
            <source src={attachment.url} type="video/mp4" />
            {__('Your browser does not support the video tag')}.
          </video>
        </ItemInfo>
      </AttachmentWrapper>
    );
  };

  onLoadImage = () => {
    const { scrollBottom } = this.props;

    if (scrollBottom) {
      scrollBottom();
    }
  };

  renderImagePreview(attachment) {
    return (
      <ImageWithPreview
        onLoad={this.onLoadImage}
        alt={attachment.url}
        src={attachment.url}
      />
    );
  }

  renderAtachment = ({ attachment }) => {
    if (!attachment.type) {
      return null;
    }

    const { simple } = this.props;

    if (attachment.type.startsWith('image')) {
      if (simple) {
        return this.renderImagePreview(attachment);
      }

      return (
        <AttachmentWrapper>
          <PreviewWrapper>{this.renderImagePreview(attachment)}</PreviewWrapper>
          <ItemInfo>{this.renderOtherInfo(attachment)}</ItemInfo>
        </AttachmentWrapper>
      );
    }

    const url = attachment.url || attachment.name || '';
    const fileExtension = url.split('.').pop();

    let filePreview;

    switch (fileExtension) {
      case 'docx':
        filePreview = this.renderOtherFile(attachment, 'doc');
        break;
      case 'pptx':
        filePreview = this.renderOtherFile(attachment, 'ppt');
        break;
      case 'xlsx':
        filePreview = this.renderOtherFile(attachment, 'xls');
        break;
      case 'mp4':
        filePreview = this.renderVideoFile(attachment);
        break;
      case 'zip':
      case 'csv':
      case 'doc':
      case 'ppt':
      case 'psd':
      case 'avi':
      case 'txt':
      case 'rar':
      case 'mp3':
      case 'pdf':
      case 'png':
      case 'xls':
      case 'jpeg':
        filePreview = this.renderOtherFile(attachment, fileExtension);
        break;
      default:
        filePreview = this.renderOtherFile(attachment, 'file-2');
    }
    return filePreview;
  };

  render() {
    return this.renderAtachment(this.props);
  }
}

export default Attachment;
