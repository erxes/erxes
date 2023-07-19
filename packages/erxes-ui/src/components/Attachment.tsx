import { __, readFile } from '../utils/core';

import AttachmentWithPreview from './AttachmentWithPreview';
import { IAttachment } from '../types';
import Icon from './Icon';
import ImageWithPreview from './ImageWithPreview';
import React from 'react';
import colors from '../styles/colors';
import { rgba } from '../styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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

const PreviewWrapper = styledTS<{ large?: boolean }>(styled.div)`
  width: ${props => (props.large ? '300px' : '110px')};
  height: ${props => (props.large ? '220px' : '80px')};
  background: ${rgba(colors.colorCoreDarkBlue, 0.08)};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  overflow: hidden;
  align-self: center;

  i {
    font-size: 36px;
    cursor: pointer;
    color: ${colors.colorSecondary};
    padding: 15px 30px;
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
  large?: boolean;

  index?: number;
  attachments?: IAttachment[];
};

class Attachment extends React.Component<Props> {
  static AttachmentWrapper = AttachmentWrapper;
  static Meta = Meta;

  onLoadImage = () => {
    const { scrollBottom } = this.props;

    if (scrollBottom) {
      scrollBottom();
    }
  };

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
          <span>
            {attachment.size && (
              <div>
                {__('Size')}: {Math.round(attachment.size / 1000)}kB
              </div>
            )}
            {attachment.type && (
              <div>
                {__('Type')}: {attachment.type}
              </div>
            )}
          </span>
          {this.props.additionalItem}
        </Meta>
      </>
    );
  };

  renderOtherFile = (attachment: IAttachment, icon?: string) => {
    const { index, attachments, large } = this.props;

    return (
      <AttachmentWrapper>
        <PreviewWrapper large={large}>
          <AttachmentWithPreview
            icon={icon}
            index={index}
            onLoad={this.onLoadImage}
            attachment={attachment}
            attachments={attachments}
          />
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

  renderImagePreview(attachment) {
    return (
      <ImageWithPreview
        onLoad={this.onLoadImage}
        alt={attachment.url}
        src={attachment.url}
      />
    );
  }

  renderAudioFile(attachment) {
    return (
      <audio controls={true}>
        <source src={attachment.url} type="audio/ogg" />
      </audio>
    );
  }
  renderAudioWavFile(attachment) {
    return (
      <audio controls={true}>
        <source src={attachment.url} type="audio/wav" />
      </audio>
    );
  }
  renderMp3File(attachment) {
    return (
      <audio controls={true}>
        <source src={attachment.url} type="audio/mpeg" />
      </audio>
    );
  }

  renderAttachment = ({ attachment }) => {
    if (!attachment.type) {
      return null;
    }

    const { simple } = this.props;

    if (attachment.type.startsWith('image')) {
      if (simple) {
        return this.renderImagePreview(attachment);
      }

      return this.renderOtherFile(attachment);
    }

    if (attachment.type === 'audio') {
      return this.renderAudioFile(attachment);
    }

    if (attachment.type === 'video') {
      return this.renderVideoFile(attachment);
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
      case 'video':
        filePreview = this.renderVideoFile(attachment);
        break;
      case 'audio':
        filePreview = this.renderAudioFile(attachment);
        break;
      case 'wav':
        filePreview = this.renderAudioWavFile(attachment);
        break;
      case 'wave':
        filePreview = this.renderAudioWavFile(attachment);
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
        filePreview = this.renderMp3File(attachment);
        break;
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
    return this.renderAttachment(this.props);
  }
}

export default Attachment;
