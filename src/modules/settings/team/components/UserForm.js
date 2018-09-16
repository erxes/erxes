import { UserCommonInfos } from 'modules/auth/components';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ColumnTitle } from 'modules/common/styles/main';
import PropTypes from 'prop-types';
import * as React from 'react';
import Select from 'react-select-plus';
import { Form as CommonForm } from '../../common/components';

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

  generateDoc() {
    return {
      doc: {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        details: {
          avatar: this.state.avatar,
          position: document.getElementById('position').value,
          fullName: document.getElementById('fullName').value,
          location: document.getElementById('user-location').value,
          description: document.getElementById('description').value
        },
        channelIds: this.collectValues(this.state.selectedChannels),
        password: document.getElementById('password').value,
        passwordConfirmation: document.getElementById('password-confirmation')
          .value,
        links: {
          linkedIn: document.getElementById('linkedin').value,
          twitter: document.getElementById('twitter').value,
          facebook: document.getElementById('facebook').value,
          youtube: document.getElementById('youtube').value,
          github: document.getElementById('github').value,
          website: document.getElementById('website').value
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
            defaultValue={user.role}
            id="role"
          >
            <option value="admin">{__('Admin')}</option>
            <option value="contributor">{__('Contributor')}</option>
          </FormControl>
        </FormGroup>

        {this.renderChannels()}

        <br />

        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl id="password" type="password" />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password confirmation</ControlLabel>
          <FormControl id="password-confirmation" type="password" />
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
