import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { Alert, uploadHandler } from 'modules/common/utils';
import { ProfileWrapper, ProfileRow } from '../styles';

const propTypes = {
  user: PropTypes.object.isRequired,
  onAvatarUpload: PropTypes.func.isRequired
};

class UserCommonInfos extends Component {
  constructor(props) {
    super(props);

    const defaultAvatar = '/images/avatar-colored.png';

    this.state = {
      avatarPreviewUrl: this.props.user.details.avatar || defaultAvatar,
      avatarPreviewStyle: {}
    };

    this.handleImageChange = this.handleImageChange.bind(this);
  }

  handleImageChange(e) {
    const imageFile = e.target.files[0];

    uploadHandler({
      file: imageFile,

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
    const user = this.props.user;
    const { __ } = this.context;
    const { avatarPreviewStyle, avatarPreviewUrl } = this.state;

    return (
      <ProfileWrapper>
        <FormGroup>
          <ControlLabel>{__('Photo')}</ControlLabel>
          <img alt="avatar" style={avatarPreviewStyle} src={avatarPreviewUrl} />

          <FormControl type="file" onChange={this.handleImageChange} />
        </FormGroup>

        <ProfileRow>
          <FormGroup>
            <ControlLabel>{__('Name')}</ControlLabel>
            <FormControl
              type="text"
              id="fullName"
              defaultValue={user.details.fullName}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Position')}</ControlLabel>
            <FormControl
              type="text"
              id="position"
              defaultValue={user.details.position}
            />
          </FormGroup>
        </ProfileRow>

        <ProfileRow>
          <FormGroup>
            <ControlLabel>{__('Username')}</ControlLabel>
            <FormControl
              type="text"
              id="username"
              defaultValue={user.username}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Email')}</ControlLabel>
            <FormControl type="email" id="email" defaultValue={user.email} />
          </FormGroup>
        </ProfileRow>

        <ProfileRow>
          <FormGroup>
            <ControlLabel>{__('Twitter username')}</ControlLabel>
            <FormControl
              type="text"
              id="twitterUsername"
              defaultValue={user.details.twitterUsername}
            />
          </FormGroup>
        </ProfileRow>
      </ProfileWrapper>
    );
  }
}

UserCommonInfos.propTypes = propTypes;
UserCommonInfos.contextTypes = {
  __: PropTypes.func
};

export default UserCommonInfos;
