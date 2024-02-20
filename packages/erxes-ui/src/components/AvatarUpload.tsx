import { colors } from '../styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import React from 'react';
import { readFile } from '../utils/core';
import Alert from '../utils/Alert';
import uploadHandler from '../utils/uploadHandler';
import Icon from './Icon';
import Spinner from './Spinner';

const Avatar = styledTS<{ square?: boolean; width: number; height: number }>(
  styled.div,
)`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 50%;

  ${(props) =>
    props.square &&
    css`
      border-radius: 5px;
      background: ${colors.colorPrimary};
      padding: 20px;
    `};

  label {
    color: ${colors.colorWhite};
    transition: background 0.3s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;

    i {
      visibility: hidden;
      opacity: 0;
      transition: all 0.3s ease;
    }

    &:hover {
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.4);

      i {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  input[type='file'] {
    display: none;
  }

  img {
    display: block;
    width: 100%;
  }
`;

type Props = {
  avatar?: string;
  defaultAvatar?: string;
  title?: string;
  extraFormData?: Array<{ key: string; value: string }>;
  onAvatarUpload: (response: any) => void;
  backgroundColor?: string;
  square?: boolean;
  width?: number;
  height?: number;
};

type State = {
  avatarPreviewStyle: any;
  avatarPreviewUrl: string;
  uploadPreview: any;
};

class AvatarUpload extends React.Component<Props, State> {
  constructor(props, context) {
    super(props, context);

    const defaultAvatar = props.defaultAvatar || '/images/avatar-colored.svg';

    this.state = {
      avatarPreviewUrl: this.props.avatar || defaultAvatar,
      avatarPreviewStyle: {},
      uploadPreview: null,
    };
  }

  setUploadPreview = (uploadPreview) => {
    this.setState({ uploadPreview });
  };

  handleImageChange = (e) => {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,
      extraFormData: this.props.extraFormData || [],

      beforeUpload: () => {
        this.setState({ avatarPreviewStyle: { opacity: '0.2' } });
      },

      afterUpload: ({ response, status }) => {
        this.setState({
          avatarPreviewStyle: { opacity: '1' },
        });

        // call success event
        this.props.onAvatarUpload(response);

        // remove preview
        if (this.setUploadPreview) {
          this.setUploadPreview(null);
        }

        if (status === 'ok') {
          Alert.info('Looking good!');
        } else {
          Alert.error(response);
        }
      },

      afterRead: ({ result, fileInfo }) => {
        if (this.setUploadPreview) {
          this.setUploadPreview(Object.assign({ data: result }, fileInfo));
        }
        this.setState({
          avatarPreviewUrl: result,
        });
      },
    });
  };

  renderUploadLoader() {
    if (!this.state.uploadPreview) {
      return null;
    }

    return <Spinner />;
  }

  render() {
    const { avatarPreviewStyle, avatarPreviewUrl } = this.state;
    const { square, width = 100, height = 100, backgroundColor } = this.props;

    return (
      <Avatar
        square={square}
        width={width}
        height={height}
        style={{ background: backgroundColor }}
      >
        <img
          alt="avatar"
          style={avatarPreviewStyle}
          src={readFile(avatarPreviewUrl)}
        />
        <label>
          <Icon icon="export" size={30} />
          <input type="file" onChange={this.handleImageChange} />
        </label>
        {this.renderUploadLoader()}
      </Avatar>
    );
  }
}

export default AvatarUpload;
