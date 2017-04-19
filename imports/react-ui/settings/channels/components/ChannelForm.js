import React, { PropTypes, Component } from 'react';
import Select from 'react-select-plus';
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
    this.state = {
      selectedIntegrations: this.generateIntegrationsParams(props.selectedIntegrations),
      selectedMembers: this.generateMembersParams(props.selectedMembers),
    };
  }

  collectValues(items) {
    return items.map(item => item.value);
  }

  generateGroupedIntegrations(integrations) {
    const brandsMap = {};

    integrations.forEach(integration => {
      const brand = integration.brand();
      const brandName = brand.name;

      if (!brandsMap[brandName]) {
        brandsMap[brandName] = [];
      }

      brandsMap[brandName].push({
        channels: integration.channels(),
        value: integration._id,
        label: integration.name,
        kind: integration.kind,
      });
    });

    const results = [];

    Object.keys(brandsMap).forEach(brandName => {
      results.push({
        label: brandName,
        options: brandsMap[brandName],
      });
    });
    return results;
  }

  generateIntegrationsParams(integrations) {
    return integrations.map(integration => ({
      channels: integration.channels(),
      value: integration._id,
      label: integration.name,
      kind: integration.kind,
      groupId: integration.brandId,
    }));
  }

  generateMembersParams(members) {
    return members.map(member => ({
      value: member._id,
      label: member.details.fullName || '',
    }));
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

    methodName.call(params, error => {
      if (error) return Alert.error(error.reason);

      Alert.success('Congrats');
      return this.context.closeModal();
    });
  }

  renderChannelTip(channels) {
    const array = channels || [];
    const count = array.length;
    if (count !== 0) {
      const channelNames = array.map(c => c.name);
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
    const { integrations, members } = this.props;
    const channel = this.props.channel || { memberIds: [], integrationIds: [] };
    const self = this;
    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="channel-name" defaultValue={channel.name} type="text" required />
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

          <Select
            placeholder="Choose integrations"
            onChange={items => {
              self.setState({ selectedIntegrations: items });
            }}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
                <span className="kind"> {option.kind}</span>
                {self.renderChannelTip(option.channels)}
              </div>
            )}
            value={self.state.selectedIntegrations}
            options={self.generateGroupedIntegrations(integrations)}
            multi
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Members</ControlLabel>

          <Select
            placeholder="Choose members"
            onChange={items => {
              self.setState({ selectedMembers: items });
            }}
            value={self.state.selectedMembers}
            options={self.generateMembersParams(members)}
            multi
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
