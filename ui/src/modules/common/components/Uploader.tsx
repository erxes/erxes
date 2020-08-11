import { __, Alert, confirm, uploadHandler } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { rgba } from '../styles/color';
import colors from '../styles/colors';
import { IAttachment } from '../types';
import Spinner from './Spinner';
import { readFile } from '../utils';
import Icon from 'modules/common/components/Icon';
import ImageWithPreview from 'modules/common/components/ImageWithPreview';

export const AttachmentWrapper = styled.div`
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  color: ${colors.textPrimary};
  position: relative;
  img {
    max-width: 100%;
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

const List = styled.div`
  margin: 10px 0;
`;

const Item = styled.div`
  border-radius: 7px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  &:hover {
    background: ${rgba(colors.colorCoreDarkBlue, 0.08)};
  }
`;

const Delete = styled.span`
  margin-right: 15px;
  text-decoration: underline;
  transition: all 0.3s ease;
  color: ${colors.colorCoreGray};
  align-self: center;
  font-size: 20px;
  &:hover {
    color: ${colors.colorCoreBlack};
    cursor: pointer;
  }
`;

const ToggleButton = styled.div`
  padding: 7px 15px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: ${rgba(colors.colorCoreDarkBlue, 0.07)};
  }
`;

const LoadingContainer = styled(List)`
  background: ${colors.bgActive};
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  > div {
    height: 80px;
    margin-right: 7px;
  }
`;

const UploadBtn = styled.div`
  position: relative;
  margin-top: 10px;
  label {
    padding: 7px 15px;
    background: ${rgba(colors.colorCoreDarkBlue, 0.05)};
    border-radius: 4px;
    font-weight: 500;
    transition: background 0.3s ease;
    display: inline-block;
    &:hover {
      background: ${rgba(colors.colorCoreDarkBlue, 0.1)};
      cursor: pointer;
    }
  }
  input[type='file'] {
    display: none;
  }
`;

type Props = {
  defaultFileList: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  single?: boolean;
  limit?: number;
  multiple?: boolean;
  simple?: boolean;
  attachment: IAttachment;
  scrollBottom?: () => void;
};

type State = {
  attachments: IAttachment[];
  loading: boolean;
  hideOthers: boolean;
};

class Uploader extends React.Component<Props, State> {
  static defaultProps = {
    multiple: true,
    limit: 4
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      attachments: props.defaultFileList || [],
      loading: false,
      hideOthers: true
    };
  }

  handleFileInput = ({ target }) => {
    const files = target.files;

    uploadHandler({
      files,

      beforeUpload: () => {
        this.setState({
          loading: true
        });
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== 'ok') {
          Alert.error(response);
          return this.setState({ loading: false });
        }

        Alert.info('Success');

        // set attachments
        const attachment = { url: response, ...fileInfo };

        const attachments = [attachment, ...this.state.attachments];

        this.props.onChange(attachments);

        this.setState({
          loading: false,
          attachments
        });
      }
    });

    target.value = '';
  };

  removeAttachment = (index: number) => {
    const attachments = [...this.state.attachments];

    attachments.splice(index, 1);

    this.setState({ attachments });

    this.props.onChange(attachments);
  };

  renderItem = (item: IAttachment, index: number) => {
    const removeAttachment = () => {
      confirm().then(() => this.removeAttachment(index));
    };

    return (
      <Item key={item.url}>
        <AttachmentWrapper>
          <PreviewWrapper>
            <ImageWithPreview
              alt={this.state.attachments[index].url}
              src={this.state.attachments[index].url}
            />
          </PreviewWrapper>
          <ItemInfo>{this.renderOtherInfo(item)}</ItemInfo>
        </AttachmentWrapper>
        {/* <Attachment attachment={item}/> */}
        <Delete onClick={removeAttachment}>
          <Icon icon="trash-alt" />
        </Delete>
      </Item>
    );
  };

  renderUploadButton() {
    const { multiple, single } = this.props;

    if (single && this.state.attachments.length > 0) {
      return null;
    }

    return (
      <UploadBtn>
        <label>
          {__('Upload an attachment')}
          <input
            type="file"
            multiple={multiple}
            onChange={this.handleFileInput}
          />
        </label>
      </UploadBtn>
    );
  }

  toggleAttachments = () => {
    this.setState({ hideOthers: !this.state.hideOthers });
  };

  renderToggleButton = (hiddenCount: number) => {
    if (hiddenCount > 0) {
      const buttonText = this.state.hideOthers
        ? `${__('View all attachments')} (${hiddenCount} ${__('hidden')})`
        : `${__('Show fewer attachments')}`;

      return (
        <ToggleButton onClick={this.toggleAttachments}>
          {buttonText}
        </ToggleButton>
      );
    }

    return null;
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
          {attachment.size && (
            <span>Size: {Math.round(attachment.size / 1000)}kB</span>
          )}
          {/* {this.props.additionalItem} */}
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

  renderImagePreview(attachment) {
    return <ImageWithPreview alt={attachment.url} src={attachment.url} />;
  }

  renderAtachment = ({ attachment }) => {
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
    const { limit = 4 } = this.props;
    const { attachments, hideOthers, loading } = this.state;

    const length = attachments.length;

    return (
      <>
        {loading && (
          <LoadingContainer>
            <Spinner objective={true} size={18} />
            {__('Uploading')}...
          </LoadingContainer>
        )}
        <List>
          {this.state.attachments
            .slice(0, limit && hideOthers ? limit : length)
            .map((item, index) => this.renderItem(item, index))}
        </List>
        {this.renderToggleButton(length - limit)}
        {this.renderUploadButton()}
      </>
    );
  }
}

export default Uploader;
