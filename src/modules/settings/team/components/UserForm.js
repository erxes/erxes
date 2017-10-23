import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Select from 'react-select-plus';
import { UserCommonInfos } from 'modules/auth/components';
import { Form as CommonForm } from '../../common/components';

class UserForm extends CommonForm {
  constructor(props, context) {
    super(props, context);

    this.generateChannelsParams = this.generateChannelsParams.bind(this);
    this.collectValues = this.collectValues.bind(this);

    this.state = {
      selectedChannels: this.generateChannelsParams(props.selectedChannels)
    };
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
        avatar: document.getElementById('avatar').value,
        position: document.getElementById('position').value,
        fullName: document.getElementById('fullName').value,
        username: document.getElementById('username').value,
        twitterUsername: document.getElementById('twitterUsername').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        passwordConfirmation: document.getElementById('password-confirmation')
          .value,
        role: document.getElementById('role').value,
        channelIds: this.collectValues(this.state.selectedChannels)
      }
    };
  }

  renderContent(object) {
    const user = object._id ? object : { details: {}, emails: [{}] };

    return (
      <div>
        <UserCommonInfos user={user} />

        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl id="password" type="password" />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password confirmation</ControlLabel>
          <FormControl id="password-confirmation" type="password" />
        </FormGroup>

        <FormGroup controlId="role">
          <ControlLabel>Role</ControlLabel>

          <FormControl componentClass="select" defaultValue={user.details.role}>
            <option value="admin">Admin</option>
            <option value="contributor">Contributor</option>
          </FormControl>
        </FormGroup>

        {this.renderChannels()}
      </div>
    );
  }
}

export default UserForm;
