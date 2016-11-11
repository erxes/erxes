import { _ } from 'meteor/underscore';
import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Checkbox,
  ButtonToolbar,
  Button,
  Modal,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import UserCommonInfos from '/imports/react-ui/auth/components/UserCommonInfos';


const propTypes = {
  user: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  channels: PropTypes.array.isRequired,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class InviteForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  collectCheckboxValues(name) {
    const values = [];

    _.each(document.getElementsByName(name), (elem) => {
      if (elem.checked) {
        values.push(elem.value);
      }
    });

    return values;
  }

  handleSubmit(e) {
    e.preventDefault();

    const doc = {
      avatar: document.getElementById('avatar').value,
      fullName: document.getElementById('fullName').value,
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      passwordConfirmation: document.getElementById('password-confirmation').value,
      role: document.getElementById('role').value,
      channelIds: this.collectCheckboxValues('channels'),
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

  renderChannels() {
    return (
      <FormGroup>
        <ControlLabel>Choose the channels</ControlLabel><br />
        {
          this.props.channels.map(channel =>
            <Checkbox
              key={channel._id}
              value={channel._id}
              name="channels"
              defaultChecked={channel.memberIds.includes(this.props.user._id)}
              inline
            >
              {channel.name}
            </Checkbox>
          )
        }
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
          <FormControl
            id="password"
            type="password"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password confirmation</ControlLabel>
          <FormControl
            id="password-confirmation"
            type="password"
          />
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
