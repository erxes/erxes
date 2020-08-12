import { __, Alert, confirm, uploadHandler } from 'modules/common/utils';
import React from 'react';
import { IAttachment } from '../types';
import Spinner from './Spinner';
import { readFile } from '../utils';
import Icon from 'modules/common/components/Icon';
import ImageWithPreview from 'modules/common/components/ImageWithPreview';
import {
  AttachmentWrapper,
  ItemInfo,
  UploadBtn,
  LoadingContainer,
  PreviewWrapper,
  Download,
  ToggleButton,
  Delete,
  Item,
  List,
  AttachmentName,
  Meta
} from '../styles/attachmentcss';

type Props = {
  defaultFileList: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  single?: boolean;
  limit?: number;
  multiple?: boolean;
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
