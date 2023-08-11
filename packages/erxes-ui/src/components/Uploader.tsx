import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '../styles/colors';
import { rgba } from '../styles/ecolor';
import { IAttachment } from '../types';
import Alert from '../utils/Alert';
import { __ } from '../utils/core';
import uploadHandler from '../utils/uploadHandler';
import Spinner from './Spinner';
import AttachmentsGallery from './AttachmentGallery';
import Icon from './Icon';
import { Meta } from './Attachment';
import Tip from './Tip';

const LoadingContainer = styledTS<{ showOnlyIcon?: boolean }>(styled.div)`
  ${props =>
    props.showOnlyIcon
      ? `
  height: 20px;
  width: 20px;
  position: relative;
  margin-left: 8px;
  `
      : `margin: 10px 0;
  background: ${colors.bgActive};
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  > div {
    height: 80px;
    margin-right: 7px;
  }`}
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

const UploadBtnWithIcon = styled.div`
  label {
    align-items: center;
    transition: background 0.3s ease;
    display: flex;
    margin: 0 0 5px;
    font-weight: bold;
    position: relative;
    margin-top: 10px;
    padding: 0px 15px;
    background: ${rgba(colors.colorCoreDarkBlue, 0.05)};
    border-radius: 4px;

    &:hover {
      background: ${rgba(colors.colorCoreDarkBlue, 0.1)};
      cursor: pointer;
    }
  }

  i {
    font-size: 36px;
    cursor: pointer;
    color: #6569df;
    padding: 15px 30px;
  }

  input[type='file'] {
    display: none;
  }
`;

const UploadIconBtn = styled.div`
  i {
    font-size: 18px;
    color: ${colors.colorLightGray};
    padding: 0;
  }
`;

type Props = {
  defaultFileList: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  single?: boolean;
  limit?: number;
  multiple?: boolean;
  accept?: string;
  text?: string;
  icon?: string;
  warningText?: string;
  showOnlyIcon?: boolean;
  noPreview?: boolean;
};

type State = {
  attachments: IAttachment[];
  loading: boolean;
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
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.defaultFileList) !==
      JSON.stringify(this.props.defaultFileList)
    ) {
      this.setState({ attachments: nextProps.defaultFileList });
    }
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
          Alert.error(response.statusText);
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

  renderUploadButton() {
    const {
      multiple,
      single,
      text,
      accept,
      icon,
      warningText,
      showOnlyIcon
    } = this.props;

    if (single && this.state.attachments.length > 0) {
      return null;
    }

    if (showOnlyIcon) {
      return (
        <UploadIconBtn>
          <label>
            <Tip text={__('Attach file')} placement="top">
              <Icon icon={icon || 'attach'} />
            </Tip>

            <input
              type="file"
              multiple={multiple}
              onChange={this.handleFileInput}
              accept={accept || ''}
            />
          </label>
        </UploadIconBtn>
      );
    }

    if (!icon) {
      return (
        <UploadBtn>
          <label>
            {__('Upload an attachment')}
            <input
              type="file"
              multiple={multiple}
              onChange={this.handleFileInput}
              accept={accept || ''}
            />
          </label>
        </UploadBtn>
      );
    }

    return (
      <UploadBtnWithIcon>
        <label>
          {icon ? <Icon icon={icon} /> : null}
          <div>
            <span>{text ? __(text) : __('Upload an attachment')}</span>
            <Meta>
              <span>{warningText}</span>
            </Meta>
          </div>

          <input
            type="file"
            multiple={multiple}
            onChange={this.handleFileInput}
            accept={accept || ''}
          />
        </label>
      </UploadBtnWithIcon>
    );
  }

  renderPreview() {
    const { limit = 4, onChange, noPreview } = this.props;
    const { attachments } = this.state;

    if (noPreview) {
      return null;
    }
    return (
      <AttachmentsGallery
        attachments={attachments}
        limit={limit}
        onChange={onChange}
        removeAttachment={this.removeAttachment}
      />
    );
  }

  renderLoader() {
    const { showOnlyIcon, noPreview } = this.props;

    if (noPreview) {
      return (
        <LoadingContainer showOnlyIcon={showOnlyIcon}>
          <Spinner size={18} />
        </LoadingContainer>
      );
    }

    return (
      <LoadingContainer>
        <Spinner objective={true} size={18} />
        {__('Uploading')}...
      </LoadingContainer>
    );
  }

  render() {
    const { loading } = this.state;

    return (
      <>
        {loading && this.renderLoader()}
        {this.renderPreview()}
        {this.renderUploadButton()}
      </>
    );
  }
}

export default Uploader;
