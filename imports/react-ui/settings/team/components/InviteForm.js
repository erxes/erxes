import React, { PropTypes, Component } from 'react';
import Select from 'react-select-plus';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
  Modal,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { UserCommonInfos } from '/imports/react-ui/auth/components';

const propTypes = {
  user: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  channels: PropTypes.array.isRequired,
  selectedChannels: PropTypes.array,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class InviteForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.generateChannelsParams = this.generateChannelsParams.bind(this);
    this.collectValues = this.collectValues.bind(this);
    this.state = {
      selectedChannels: this.generateChannelsParams(props.selectedChannels),
    };
  }

  handleSubmit(e) {
    e.preventDefault();

    const doc = {
      avatar: document.getElementById('avatar').value,
      position: document.getElementById('position').value,
      fullName: document.getElementById('fullName').value,
      username: document.getElementById('username').value,
      twitterUsername: document.getElementById('twitterUsername').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      passwordConfirmation: document.getElementById('password-confirmation').value,
      role: document.getElementById('role').value,
      channelIds: this.collectValues(this.state.selectedChannels),
    };

    // when update
    if (this.props.user._id) {
      doc.userId = this.props.user._id;
    }

    this.props.save(doc, error => {
      if (error) {
        return Alert.error(error.reason);
      }

      Alert.success('Congrats');
      return this.context.closeModal();
    });
  }

  generateChannelsParams(channels) {
    return channels.map(channel => ({
      value: channel._id,
      label: channel.name,
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
        <ControlLabel>Choose the channels</ControlLabel><br />

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

  render() {
    const onClose = () => this.context.closeModal();
    const user = this.props.user;

    return (
      <form id="invite-form" onSubmit={this.handleSubmit}>
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

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button bsStyle="link" onClick={onClose}>Cancel</Button>
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

InviteForm.propTypes = propTypes;
InviteForm.contextTypes = contextTypes;

export default InviteForm;
