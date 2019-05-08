import { Icon, ImageWithPreview } from 'modules/common/components';
import * as React from 'react';
import styled from 'styled-components';
import { IAttachment } from '../types';
import { readFile } from '../utils';

const sizing = 30;

const Overlay = styled.a`
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  left: 0;
  top: 0;
  transition: all 0.3s ease;

  > div {
    position: absolute;
    color: #fff;
    width: ${sizing}px;
    height: ${sizing}px;
    text-align: center;
    border-radius: ${sizing / 2}px;
    line-height: ${sizing - 2}pxpx;
    left: 50%;
    top: 50%;
    border: 1px solid #fff;
    margin-left: -15px;
    margin-top: -15px;

    i {
      margin: 0;
    }
  }
`;

const AttachmentWrapper = styled.div`
  display: inline-block;
  position: relative;
  max-width: 360px;
  transition: all ease 0.3s;
  color: inherit;

  img {
    max-width: 100%;
  }

  &:hover ${Overlay}, &:hover ${Overlay} > div {
    opacity: 1;
  }
`;

const FileWrapper = styled.div`
  position: relative;
  padding-left: 40px;
  padding-right: 20px;
  min-width: 120px;
  min-height: 36px;
  line-height: 36px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;

  i {
    font-size: 26px;
    position: absolute;
    left: 10px;
    top: 0;
  }

  span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    direction: rtl;
    text-align: left;
    max-width: 200px;
    display: block;
  }
`;

type Props = {
  attachment: IAttachment;
  scrollBottom?: () => void;
};

class Attachment extends React.Component<Props> {
  renderOtherFile = (name, icon) => {
    return (
      <React.Fragment>
        <FileWrapper key="wrapper">
          <Icon icon={icon} /> <span>{name}</span>
        </FileWrapper>
        <Overlay
          key="overlay"
          href={readFile(this.props.attachment.url)}
          target="_blank"
        >
          <div>
            <Icon icon="download" />
          </div>
        </Overlay>
      </React.Fragment>
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
        <ImageWithPreview
          onLoad={this.onLoadImage}
          alt={attachment.url}
          src={attachment.url}
        />
      );
    }

    const url = attachment.url || attachment.name || '';
    const name = attachment.name || attachment.url || '';
    const fileExtension = url.split('.').pop();

    let filePreview;
    switch (fileExtension) {
      case 'png':
      case 'jpeg':
      case 'jpg':
        filePreview = (
          <ImageWithPreview alt={url} src={url} onLoad={this.onLoadImage} />
        );
        break;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'pdf':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
        filePreview = this.renderOtherFile(name, 'file');
        break;
      case 'mp4':
      case 'avi':
        filePreview = this.renderOtherFile(name, 'videocamera');
        break;
      case 'mp3':
      case 'wav':
        filePreview = this.renderOtherFile(name, 'music');
        break;
      case 'zip':
        filePreview = this.renderOtherFile(name, 'cube');
        break;
      default:
        filePreview = this.renderOtherFile(name, 'clipboard-1');
    }
    return filePreview;
  };

  render() {
    const props = this.props;

    return <AttachmentWrapper>{this.renderAtachment(props)}</AttachmentWrapper>;
  }
}

export default Attachment;
