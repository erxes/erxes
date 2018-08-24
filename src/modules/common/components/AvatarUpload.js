import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Icon
} from 'modules/common/components';
import { Alert, uploadHandler } from 'modules/common/utils';
import { Avatar } from 'modules/common/styles/main';

const propTypes = {
  avatar: PropTypes.string,
  defaultAvatar: PropTypes.string,
  onAvatarUpload: PropTypes.func
};

class AvatarUpload extends Component {
  constructor(props, context) {
    super(props, context);

    const defaultAvatar = props.defaultAvatar || '/images/avatar-colored.svg';

    this.state = {
      avatarPreviewUrl: this.props.avatar || defaultAvatar,
      avatarPreviewStyle: {}
    };

    this.handleImageChange = this.handleImageChange.bind(this);
  }

  handleImageChange(e) {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.setState({ avatarPreviewStyle: { opacity: '0.2' } });
      },

      afterUpload: ({ response }) => {
        this.setState({
          avatarPreviewStyle: { opacity: '1' }
        });

        // call success event
        this.props.onAvatarUpload(response);

        Alert.info('Looking good!');
      },

      afterRead: ({ result }) => {
        this.setState({ avatarPreviewUrl: result });
      }
    });
  }

  render() {
    const { avatarPreviewStyle, avatarPreviewUrl } = this.state;

    return (
      <Avatar>
        <FormGroup>
          <ControlLabel>Photo</ControlLabel>
          <img alt="avatar" style={avatarPreviewStyle} src={avatarPreviewUrl} />
          <label>
            <Icon icon="upload icon" size={30} />
            <FormControl type="file" onChange={this.handleImageChange} />
          </label>
        </FormGroup>
      </Avatar>
    );
  }
}

AvatarUpload.propTypes = propTypes;

export default AvatarUpload;
