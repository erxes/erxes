import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { timezones } from 'modules/settings/integrations/constants';
import { Alert, uploadHandler } from 'modules/common/utils';
import {
  FormWrapper,
  FormColumn,
  ColumnTitle
} from 'modules/common/styles/main';
import { Avatar } from '../styles';

const propTypes = {
  user: PropTypes.object.isRequired,
  onAvatarUpload: PropTypes.func.isRequired
};

class UserCommonInfos extends Component {
  constructor(props) {
    super(props);

    const defaultAvatar = '/images/avatar-colored.svg';

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
      <Fragment>
        <Avatar>
          <FormGroup>
            <ControlLabel>Photo</ControlLabel>
            <img
              alt="avatar"
              style={avatarPreviewStyle}
              src={avatarPreviewUrl}
            />
            <FormControl type="file" onChange={this.handleImageChange} />
          </FormGroup>
        </Avatar>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                name="fullName"
                validations="isValue"
                validationError="Please enter a name"
                value={details.fullName || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <FormControl
                type="text"
                name="email"
                validations="isEmail"
                validationError="Not valid email format"
                value={user.email}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                type="text"
                name="description"
                validations="isValue"
                validationError="Please enter a description"
                componentClass="textarea"
                value={details.description || ''}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Username</ControlLabel>
              <FormControl
                type="text"
                name="username"
                validations="isValue"
                validationError="Please enter a username"
                value={user.username}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Position</ControlLabel>
              <FormControl
                type="text"
                name="position"
                validations="isValue"
                validationError="Please enter a position"
                value={details.position || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Location</ControlLabel>
              <FormControl
                componentClass="select"
                value={details.location}
                validations="isValue"
                validationError="Please provide your location"
                name="userLocation"
                options={timezones}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <ColumnTitle>{__('Links')}</ColumnTitle>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>LinkedIn</ControlLabel>
              <FormControl
                type="text"
                name="linkedin"
                validations="isUrl"
                validationError="Not a valid URL format"
                value={links.linkedIn || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl
                type="text"
                name="twitter"
                validations="isUrl"
                validationError="Not a valid URL format"
                value={links.twitter || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl
                type="text"
                name="facebook"
                validations="isUrl"
                validationError="Not a valid URL format"
                value={links.facebook || ''}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Youtube</ControlLabel>
              <FormControl
                type="text"
                name="youtube"
                validations="isUrl"
                validationError="Not a valid URL format"
                value={links.youtube || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl
                type="text"
                name="github"
                validations="isUrl"
                validationError="Not a valid URL format"
                value={links.github || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl
                type="text"
                name="website"
                validations="isUrl"
                validationError="Not a valid URL format"
                value={links.website || ''}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </Fragment>
    );
  }
}

UserCommonInfos.propTypes = propTypes;
UserCommonInfos.contextTypes = {
  __: PropTypes.func
};

export default UserCommonInfos;
