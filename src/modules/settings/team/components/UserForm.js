import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import Select from 'react-select-plus';
import { UserCommonInfos } from 'modules/auth/components';
import { Form as CommonForm } from '../../common/components';
import { ColumnTitle } from 'modules/common/styles/main';

class UserForm extends CommonForm {
  constructor(props, context) {
    super(props, context);

    this.onAvatarUpload = this.onAvatarUpload.bind(this);
    this.generateChannelsParams = this.generateChannelsParams.bind(this);
    this.collectValues = this.collectValues.bind(this);

    const user = props.object || { details: {} };
    const defaultAvatar = '/images/avatar-colored.svg';

    this.state = {
      avatar: user.details.avatar || defaultAvatar,
      selectedChannels: this.generateChannelsParams(props.selectedChannels)
    };
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  generateChannelsParams(channels) {
    return channels.map(channel => ({
      value: channel._id,
      label: channel.name
    }));
  }

  collectValues(items) {
    return items.map(item => item.value);
  }

  renderChannels() {
    const { __ } = this.context;
    const self = this;
    const { channels } = this.props;

    return (
      <FormGroup>
        <ControlLabel>Choose the channels</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose channels')}
          value={self.state.selectedChannels}
          options={self.generateChannelsParams(channels)}
          onChange={items => {
            self.setState({ selectedChannels: items });
          }}
          multi
        />
      </FormGroup>
    );
  }

  generateDoc(doc) {
    return {
      doc: {
        username: doc.username,
        email: doc.email,
        role: doc.role,
        details: {
          avatar: this.state.avatar,
          position: doc.position,
          fullName: doc.fullName,
          location: doc.userLocation,
          description: doc.description
        },
        channelIds: this.collectValues(this.state.selectedChannels),
        password: doc.password,
        passwordConfirmation: doc.passwordConfirmation,
        links: {
          linkedIn: doc.linkedin,
          twitter: doc.twitter,
          facebook: doc.facebook,
          youtube: doc.youtube,
          github: doc.github,
          website: doc.website
        }
      }
    };
  }

  renderContent(object) {
    const user = object._id ? object : { details: {} };
    const { __ } = this.context;

    return (
      <div>
        <UserCommonInfos user={user} onAvatarUpload={this.onAvatarUpload} />
        <ColumnTitle>{__('Other')}</ColumnTitle>
        <FormGroup>
          <ControlLabel>Role</ControlLabel>

          <FormControl
            componentClass="select"
            value={user.role}
            validationError="Please select a role"
            validations="isValue"
            name="role"
          >
            <option value="admin">{__('Admin')}</option>
            <option value="contributor">{__('Contributor')}</option>
          </FormControl>
        </FormGroup>

        {this.renderChannels()}

        <br />

        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl
            name="password"
            validations="isValue"
            validationError="Please provide a password"
            type="password"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password confirmation</ControlLabel>
          <FormControl
            name="passwordConfirmation"
            validations="equalsField:password"
            validationError="Password does not match"
            type="password"
          />
        </FormGroup>
      </div>
    );
  }
}

UserForm.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func
};

export default UserForm;
