import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { ProfileWrapper, ProfileRow } from '../styles';

const propTypes = {
  user: PropTypes.object.isRequired
};

class UserCommonInfos extends Component {
  constructor(props) {
    super(props);

    const defaultAvatar = '/images/userDefaultIcon.png';

    this.state = {
      avatar: this.props.user.details.avatar,
      avatarPreviewUrl: this.props.user.details.avatar || defaultAvatar,
      avatarPreviewStyle: {}
    };

    this.handleImageChange = this.handleImageChange.bind(this);
  }

  handleImageChange(e) {
    e.preventDefault();
  }

  render() {
    const user = this.props.user;
    const { avatar, avatarPreviewStyle, avatarPreviewUrl } = this.state;

    return (
      <ProfileWrapper>
        <FormGroup>
          <ControlLabel>Photo</ControlLabel>
          <img
            alt="avatar"
            className="avatar"
            style={avatarPreviewStyle}
            src={avatarPreviewUrl}
          />

          <FormControl type="file" onChange={this.handleImageChange} />
          <input type="hidden" id="avatar" value={avatar} />
        </FormGroup>

        <ProfileRow>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type="text"
              id="fullName"
              defaultValue={user.details.fullName}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Position</ControlLabel>
            <FormControl
              type="text"
              id="position"
              defaultValue={user.details.position}
            />
          </FormGroup>
        </ProfileRow>

        <ProfileRow>
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
            <FormControl type="email" id="email" defaultValue={user.email} />
          </FormGroup>
        </ProfileRow>

        <ProfileRow>
          <FormGroup>
            <ControlLabel>Twitter username</ControlLabel>
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

export default UserCommonInfos;
