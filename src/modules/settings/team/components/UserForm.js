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

class UserForm extends CommonForm {
  constructor(props, context) {
    super(props, context);

    this.onAvatarUpload = this.onAvatarUpload.bind(this);
    this.generateChannelsParams = this.generateChannelsParams.bind(this);
    this.collectValues = this.collectValues.bind(this);

    const user = props.object || { details: {} };

    this.state = {
      avatar: user.details.avatar,
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
    const self = this;
    const { channels } = this.props;

    return (
      <FormGroup>
        <ControlLabel>Choose the channels</ControlLabel>
        <br />

        <Select
          placeholder="Choose channels"
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
          twitterUsername: document.getElementById('twitterUsername').value
        },
        channelIds: this.collectValues(this.state.selectedChannels),
        password: document.getElementById('password').value,
        passwordConfirmation: document.getElementById('password-confirmation')
          .value
      }
    };
  }

  renderContent(object) {
    const user = object._id ? object : { details: {} };
    const { __ } = this.context;

    return (
      <div>
        <UserCommonInfos user={user} onAvatarUpload={this.onAvatarUpload} />

        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl id="password" type="password" />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password confirmation</ControlLabel>
          <FormControl id="password-confirmation" type="password" />
        </FormGroup>

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
      </div>
    );
  }
}

UserForm.contextTypes = {
  __: PropTypes.func
};

export default UserForm;
