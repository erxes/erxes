import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { Alert, uploadHandler } from 'modules/common/utils';
import { ProfileWrapper, ProfileColumn, ColumnTitle } from '../styles';

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
    const { avatarPreviewStyle, avatarPreviewUrl } = this.state;

    return (
      <ProfileWrapper>
        <ProfileColumn>
          <ColumnTitle>Basics</ColumnTitle>
          <FormGroup>
            <ControlLabel>Photo</ControlLabel>
            <img
              alt="avatar"
              style={avatarPreviewStyle}
              src={avatarPreviewUrl}
            />

            <FormControl type="file" onChange={this.handleImageChange} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type="text"
              id="fullName"
              defaultValue={user.details.fullName}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Username</ControlLabel>
            <FormControl
              type="text"
              id="username"
              defaultValue={user.username}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Email</ControlLabel>
            <FormControl type="text" id="email" defaultValue={user.email} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Mini-Resume</ControlLabel>
            <FormControl
              type="text"
              id="miniResume"
              componentClass="textarea"
              defaultValue={user.details.miniResume || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Position</ControlLabel>
            <FormControl
              type="text"
              id="position"
              defaultValue={user.details.position || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Location</ControlLabel>
            <FormControl
              type="text"
              id="location"
              defaultValue={user.details.location || ''}
            />
          </FormGroup>
        </ProfileColumn>
        <ProfileColumn>
          <ColumnTitle>Links</ColumnTitle>
          <FormGroup>
            <ControlLabel>LinkedIn</ControlLabel>
            <FormControl
              type="text"
              id="linkedin"
              defaultValue={user.details.linkedin || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Twitter</ControlLabel>
            <FormControl
              type="text"
              id="twitter"
              defaultValue={user.details.twitter || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Facebook</ControlLabel>
            <FormControl
              type="text"
              id="facebook"
              defaultValue={user.details.facebook || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Github</ControlLabel>
            <FormControl
              type="text"
              id="github"
              defaultValue={user.details.github || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Website</ControlLabel>
            <FormControl
              type="text"
              id="website"
              defaultValue={user.details.website || ''}
            />
          </FormGroup>
        </ProfileColumn>
      </ProfileWrapper>
    );
  }
}

UserCommonInfos.propTypes = propTypes;

export default UserCommonInfos;
