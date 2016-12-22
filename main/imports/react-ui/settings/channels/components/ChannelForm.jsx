import { _ } from 'meteor/underscore';
import React, { PropTypes, Component } from 'react';
import ReactSelectize from 'react-selectize';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Modal,
  Button,
  Checkbox,
} from 'react-bootstrap';
import { Tip } from '/imports/react-ui/common';
import Alert from 'meteor/erxes-notifier';
import { add, edit } from '/imports/api/channels/methods';


const propTypes = {
  integrations: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  channel: PropTypes.object,
  brands: PropTypes.array,
  selectedIntegrations: PropTypes.array,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class ChannelForm extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
    this.generateIntegrationsParams = this.generateIntegrationsParams.bind(this);
    this.collectValues = this.collectValues.bind(this);
    this.generateGroups = this.generateGroups.bind(this);
    this.state = {
      selectedIntegrations: this.generateIntegrationsParams(props.selectedIntegrations),
    };
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

  collectValues() {
    return this.state.selectedIntegrations.map(integration => (
      integration.value
    ));
  }

  generateIntegrationsParams(integrations) {
    return integrations.map(integration => (
      {
        integration,
        value: integration._id,
        label: integration.name,
        kind: integration.kind,
        groupId: integration.brandId,
      }
    ));
  }

  generateGroups(brands) {
    return brands.map(({ _id, name }) => (
      {
        groupId: _id,
        title: name,
      }
    ));
  }

  save(e) {
    e.preventDefault();
    const params = {
      doc: {
        name: document.getElementById('channel-name').value,
        description: document.getElementById('channel-description').value,
        memberIds: this.collectCheckboxValues('members'),
        integrationIds: this.collectValues(),
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

  renderChannelTip(integration) {
    const count = integration.channels().length;
    if (count !== 0) {
      return (
        <div className="channel-round">
          <Tip text={integration.channels().map(c => (c.name))}>
            <span>{count}</span>
          </Tip>
        </div>
      );
    }
    return null;
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };
    const MultiSelect = ReactSelectize.MultiSelect;
    const channel = this.props.channel || { memberIds: [], integrationIds: [] };
    const { brands, integrations } = this.props;
    const self = this;
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
            rows={5}
            defaultValue={channel.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Integrations</ControlLabel>

          <MultiSelect
            groups={self.generateGroups(brands)}
            options={self.generateIntegrationsParams(integrations)}
            placeholder="Choose integration"
            values={self.state.selectedIntegrations}
            onValuesChange={(items) => {
              self.setState({ selectedIntegrations: items });
            }}
            renderOption={(item) => (
              <div className="simple-option">
                <span>{item.label}</span>
                <span className="kind"> {item.kind}</span>
                {self.renderChannelTip(item.integration)}
              </div>
            )}
          />
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
