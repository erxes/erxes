import React from 'react';
import { __, Alert, uploadHandler } from 'modules/common/utils';
import { IAttachment } from '../types';
import Icon from 'modules/common/components/Icon';
import Spinner from './Spinner';
import {
  AttachmentWrapper,
  // ItemInfo,
  UploadBtn,
  LoadingContainer,
  PreviewWrapper,
  // Download,
  ToggleButton,
  Delete,
  Item,
  List,
  BiggerPreviewWrapper
  // AttachmentName,
} from '../styles/attachmentcss';

type Props = {
  defaultFileList?: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  single?: boolean;
  multiple?: boolean;
  limit?: number;
};

type State = {
  attachments: IAttachment[];
  loading: boolean;
  hideOthers: boolean;
  bigPreview: boolean;
};

class AttachmentPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      attachments: props.defaultFileList || [],
      loading: false,
      hideOthers: true,
      bigPreview: false
    };
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

  toggleImage = () => {
    this.setState({ bigPreview: !this.state.bigPreview });
  };

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

  handlePreview = item => {
    console.log(item);
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

  renderAttachments(item, index) {
    return (
      <Item key={item.url} onClick={() => this.handlePreview(item)}>
        <AttachmentWrapper>
          <PreviewWrapper>
            <img
              alt={this.state.attachments[index].url}
              src={this.state.attachments[index].url}
            />
          </PreviewWrapper>
          {/* <ItemInfo>{this.renderOtherInfo(item)}</ItemInfo> */}
        </AttachmentWrapper>
        {/* <Attachment attachment={item}/> */}
        <Delete>
          <Icon icon="trash-alt" />
        </Delete>
      </Item>
    );
  }

  render() {
    const { loading, hideOthers, attachments } = this.state;
    const { limit = 4 } = this.props;
    const length = attachments.length;

    return (
      <>
        {loading && (
          <LoadingContainer>
            <Spinner objective={true} size={18} />
            {'Uploading'}...
          </LoadingContainer>
        )}
        <List>
          {this.state.attachments
            .slice(0, limit && hideOthers ? limit : length)
            .map((item, index) => this.renderAttachments(item, index))}
        </List>
        <PreviewWithBig item={this.state.attachments} />
        {this.renderToggleButton(length - limit)}
        {this.renderUploadButton()}
      </>
    );
  }
}

export default AttachmentPreview;

export class PreviewWithBig extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      currentIndex: 0,
      visible: false
    };
  }

  left() {
    this.setState({ currentIndex: this.state.currentIndex - 1 });
  }

  right() {
    const { currentIndex } = this.state;
    let nextIndex = currentIndex - 1;

    if (nextIndex > this.props.attachment.length) {
      nextIndex = 0;
    }
  }

  renderData = this.props.item.map((data, index) => (
    <img style={{ width: 100 }} key={index} src={data.url} />
  ));

  render() {
    return (
      <>
        {this.state.visible && (
          <BiggerPreviewWrapper>
            <button>Left</button>
            {this.renderData}
            <button>Right</button>
          </BiggerPreviewWrapper>
        )}
      </>
    );
  }
}
