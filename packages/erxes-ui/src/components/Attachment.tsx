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
import VideoPlayer from './VideoPlayer';

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

const AttachmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 10px 20px;

  i {
    font-size: 10px;
    margin-left: 15px;
    cursor: pointer;
    &:hover {
      color: #555;
    }
  }
  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const AttachmentInfo = styled.div`
  display: flex;
  width: calc(100% - 25px);

  > a {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 5px;
    max-height: 20px;
  }
`;

const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

type Props = {
  attachment: IAttachment;
  scrollBottom?: () => void;
  removeAttachment?: (index: number) => void;
  additionalItem?: React.ReactNode;
  simple?: boolean;
  large?: boolean;
  withoutPreview?: boolean;

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

  renderFileSize(size: number) {
    if (size > 1000000) {
      return <>({Math.round(size / 1000000)}MB)</>;
    }
    if (size > 1000) {
      return <>({Math.round(size / 1000)}kB)</>;
    }
  }

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
                {__('Size')}: {this.renderFileSize(attachment.size)}
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

  renderWithoutPreview = () => {
    const { attachments, removeAttachment } = this.props;

    return (
      <FlexCenter>
        {attachments && (
          <AttachmentsContainer>
            {attachments.map((att, i) => (
              <div key={i}>
                <AttachmentInfo>
                  <a href={att.url}>{att.name}</a>
                  {this.renderFileSize(att.size || 0)}
                </AttachmentInfo>
                <Icon
                  size={10}
                  icon="cancel"
                  onClick={() => removeAttachment && removeAttachment(i)}
                />
              </div>
            ))}
          </AttachmentsContainer>
        )}
      </FlexCenter>
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

  renderVideoFile = (attachment, simple?: boolean) => {
    const options = {
      autoplay: false,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controls: true,
      width: '100%',
      sources: [
        {
          src: readFile(attachment.url),
          type: 'video/mp4'
        }
      ]
    };

    if (simple) {
      return <VideoPlayer options={options} />;
    }
    return (
      <AttachmentWrapper>
        <ItemInfo>
          <VideoPlayer options={options} />
        </ItemInfo>
        {this.renderOtherInfo(attachment)}
      </AttachmentWrapper>
    );
  };

  renderVideoStream = (attachment: IAttachment, simple?: boolean) => {
    const options = {
      autoplay: false,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controls: true,
      width: '100%',
      sources: [
        {
          src: attachment.url,
          type: 'application/x-mpegURL'
        }
      ]
    };

    if (simple) {
      return <VideoPlayer options={options} />;
    }

    return (
      <AttachmentWrapper>
        <ItemInfo>
          <VideoPlayer options={options} />
        </ItemInfo>
        {this.renderOtherInfo(attachment)}
      </AttachmentWrapper>
    );
  };

  renderImagePreview(attachment) {
    return (
      <ImageWithPreview
        onLoad={this.onLoadImage}
        alt={attachment.url}
        src={readFile(attachment.url)}
      />
    );
  }

  renderAudioFile(attachment) {
    return (
      <audio controls={true}>
        <source src={readFile(attachment.url)} type="audio/ogg" />
      </audio>
    );
  }
  renderAudioWavFile(attachment) {
    return (
      <audio controls={true}>
        <source src={readFile(attachment.url)} type="audio/wav" />
      </audio>
    );
  }
  renderMp3File(attachment) {
    return (
      <audio controls={true}>
        <source src={readFile(attachment.url)} type="audio/mpeg" />
      </audio>
    );
  }

  renderAttachment = ({ attachment }) => {
    if (!attachment.type) {
      return null;
    }

    const { simple, withoutPreview } = this.props;

    const url = attachment.url || attachment.name || '';
    const fileExtension = url.split('.').pop();

    if (withoutPreview) {
      return this.renderWithoutPreview();
    }

    if (attachment.type.startsWith('image')) {
      if (simple) {
        return this.renderImagePreview(attachment);
      }

      return this.renderOtherFile(attachment);
    }

    if (attachment.type.includes('audio')) {
      return this.renderAudioFile(attachment);
    }

    if (url.includes('cloudflarestream.com')) {
      return this.renderVideoStream(attachment, simple);
    }

    if (attachment.type.includes('video')) {
      return this.renderVideoFile(attachment, simple);
    }

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
      case 'm3u8':
        filePreview = this.renderVideoStream(attachment);
        break;
      case 'zip':
      case 'csv':
        filePreview = this.renderOtherFile(attachment);
        break;
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
