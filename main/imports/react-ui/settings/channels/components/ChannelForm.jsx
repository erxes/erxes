import { _ } from 'meteor/underscore';
import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Modal,
  Button,
  Checkbox,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { add, edit } from '/imports/api/channels/methods';


const propTypes = {
  integrations: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  channel: PropTypes.object,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class ChannelForm extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
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

  save(e) {
    e.preventDefault();

    const params = {
      doc: {
        name: document.getElementById('channel-name').value,
        description: document.getElementById('channel-description').value,
        memberIds: this.collectCheckboxValues('members'),
        integrationIds: this.collectCheckboxValues('integrations'),
      },
    };

    let methodName = add;

    // if edit mode
    if (this.props.channel) {
      methodName = edit;
      params.id = this.props.channel._id;
    }

    methodName.call(params, (error) => {
      if (error) return Alert.error(error.reason);

      Alert.success('Congrats');
      return this.context.closeModal();
    });
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const channel = this.props.channel || { memberIds: [], integrationIds: [] };
    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="channel-name"
            defaultValue={channel.name}
            type="text"
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="channel-description"
            componentClass="textarea"
            defaultValue={channel.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Integrations</ControlLabel>

          {this.props.integrations.map(integration =>
            <div className="integration-item" key={`c-${integration._id}`}>
              <Checkbox
                name="integrations"
                key={integration._id}
                defaultChecked={channel.integrationIds.includes(integration._id)}
                value={integration._id}
              >
              {integration.name} - {integration.kind}
              </Checkbox>
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Members</ControlLabel>

          {this.props.members.map(member =>
            <Checkbox
              name="members"
              key={member._id}
              defaultChecked={channel.memberIds.includes(member._id)}
              value={member._id}
            >
            {member.details.fullName}
            </Checkbox>
          )}
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button bsStyle="link" onClick={onClick}>Cancel</Button>
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

ChannelForm.propTypes = propTypes;
ChannelForm.contextTypes = contextTypes;

export default ChannelForm;
