import React, { PropTypes, Component } from 'react';
import ReactSelectize from 'react-selectize';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Modal,
  Button,
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
  selectedMembers: PropTypes.array,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class ChannelForm extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
    this.generateIntegrationsParams = this.generateIntegrationsParams.bind(this);
    this.generateMembersParams = this.generateMembersParams.bind(this);
    this.collectValues = this.collectValues.bind(this);
    this.generateGroups = this.generateGroups.bind(this);
    this.state = {
      selectedIntegrations: this.generateIntegrationsParams(props.selectedIntegrations),
      selectedMembers: this.generateMembersParams(props.selectedMembers),
    };
  }

  collectValues(items) {
    return items.map(item => (
      item.value
    ));
  }

  generateIntegrationsParams(integrations) {
    return integrations.map(integration => (
      {
        channels: integration.channels(),
        value: integration._id,
        label: integration.name,
        kind: integration.kind,
        groupId: integration.brandId,
      }
    ));
  }

  generateMembersParams(members) {
    return members.map(member => (
      {
        value: member._id,
        label: member.details.fullName || '',
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
        memberIds: this.collectValues(this.state.selectedMembers),
        integrationIds: this.collectValues(this.state.selectedIntegrations),
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

  renderChannelTip(channels) {
    const count = channels.length;
    if (count !== 0) {
      const channelNames = channels.map(c => (c.name));
      return (
        <Tip text={channelNames.toString()}>
          <div className="channel-round">
            <span>{count}</span>
          </div>
        </Tip>
      );
    }
    return null;
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };
    const MultiSelect = ReactSelectize.MultiSelect;
    const { brands, integrations, members } = this.props;
    const channel = this.props.channel || { memberIds: [], integrationIds: [] };
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
            renderOption={item => (
              <div className="simple-option">
                <span>{item.label}</span>
                <span className="kind"> {item.kind}</span>
                {self.renderChannelTip(item.channels)}
              </div>
            )}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Members</ControlLabel>

          <MultiSelect
            options={self.generateMembersParams(members)}
            placeholder="Choose members"
            values={self.state.selectedMembers}
            onValuesChange={(items) => {
              self.setState({ selectedMembers: items });
            }}
          />
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
