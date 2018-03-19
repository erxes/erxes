import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { timezones } from 'modules/settings/integrations/constants';
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
    const { __ } = this.context;
    const { user = {} } = this.props;
    const { details = {}, links = {} } = user;
    const { avatarPreviewStyle, avatarPreviewUrl } = this.state;

    return (
      <ProfileWrapper>
        <ProfileColumn>
          <ColumnTitle>{__('Basics')}</ColumnTitle>
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
              defaultValue={details.fullName || ''}
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
            <ControlLabel>Twitter Username</ControlLabel>
            <FormControl
              type="text"
              id="twitterUsername"
              defaultValue={details.twitterUsername}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              type="text"
              id="description"
              componentClass="textarea"
              defaultValue={details.description || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Position</ControlLabel>
            <FormControl
              type="text"
              id="position"
              defaultValue={details.position || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Location</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={details.location}
              id="user-location"
              options={timezones}
            />
          </FormGroup>
        </ProfileColumn>
        <ProfileColumn>
          <ColumnTitle>{__('Links')}</ColumnTitle>
          <FormGroup>
            <ControlLabel>LinkedIn</ControlLabel>
            <FormControl
              type="text"
              id="linkedin"
              defaultValue={links.linkedIn || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Twitter</ControlLabel>
            <FormControl
              type="text"
              id="twitter"
              defaultValue={links.twitter || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Facebook</ControlLabel>
            <FormControl
              type="text"
              id="facebook"
              defaultValue={links.facebook || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Youtube</ControlLabel>
            <FormControl
              type="text"
              id="youtube"
              defaultValue={links.youtube || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Github</ControlLabel>
            <FormControl
              type="text"
              id="github"
              defaultValue={links.github || ''}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Website</ControlLabel>
            <FormControl
              type="text"
              id="website"
              defaultValue={links.website || ''}
            />
          </FormGroup>
        </ProfileColumn>
      </ProfileWrapper>
    );
  }
}

UserCommonInfos.propTypes = propTypes;
UserCommonInfos.contextTypes = {
  __: PropTypes.func
};

export default UserCommonInfos;
