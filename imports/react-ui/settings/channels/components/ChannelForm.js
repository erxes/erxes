import React from 'react';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Tip } from '/imports/react-ui/common';
import { Form as CommonForm } from '../../common/components';

class ChannelForm extends CommonForm {
  constructor(props) {
    super(props);

    this.generateIntegrationsParams = this.generateIntegrationsParams.bind(this);
    this.generateMembersParams = this.generateMembersParams.bind(this);
    this.generateDoc = this.generateDoc.bind(this);
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
      groupId: integration.channelId,
    }));
  }

  generateMembersParams(members) {
    return members.map(member => ({
      value: member._id,
      label: member.details.fullName || '',
    }));
  }

  generateDoc() {
    return {
      doc: {
        name: document.getElementById('channel-name').value,
        description: document.getElementById('channel-description').value,
        memberIds: this.collectValues(this.state.selectedMembers),
        integrationIds: this.collectValues(this.state.selectedIntegrations),
      },
    };
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

  renderContent() {
    const { integrations, members, object } = this.props;
    const channel = object || { memberIds: [], integrationIds: [] };
    const self = this;

    return (
      <div>
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
      </div>
    );
  }
}

export default ChannelForm;
