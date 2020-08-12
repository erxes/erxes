import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import { Alert, readFile, uploadHandler } from '../utils';
import Icon from './Icon';
import Spinner from './Spinner';

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 50%;

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
  onAvatarUpload: (response: any) => void;
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
      uploadPreview: null
    };
  }

  setUploadPreview = uploadPreview => {
    this.setState({ uploadPreview });
  };

  handleImageChange = e => {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.setState({ avatarPreviewStyle: { opacity: '0.2' } });
      },

      afterUpload: ({ response, status }) => {
        this.setState({
          avatarPreviewStyle: { opacity: '1' }
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
          avatarPreviewUrl: result
        });
      }
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

    return (
      <Avatar>
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
