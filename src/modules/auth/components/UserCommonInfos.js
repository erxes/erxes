import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

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
      <div>
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

        <FormGroup>
          <ControlLabel>Username</ControlLabel>
          <FormControl type="text" id="username" defaultValue={user.username} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl
            type="email"
            id="email"
            defaultValue={user.emails[0].address}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Twitter username</ControlLabel>
          <FormControl
            type="text"
            id="twitterUsername"
            defaultValue={user.details.twitterUsername}
          />
        </FormGroup>
      </div>
    );
  }
}

UserCommonInfos.propTypes = propTypes;

export default UserCommonInfos;
