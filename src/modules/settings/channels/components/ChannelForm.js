import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  channel: PropTypes.object,
  members: PropTypes.array,
  selectedMembers: PropTypes.array,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class ChannelForm extends Component {
  constructor(props) {
    super(props);

    this.generateMembersParams = this.generateMembersParams.bind(this);
    this.generateDoc = this.generateDoc.bind(this);
    this.collectValues = this.collectValues.bind(this);
    this.save = this.save.bind(this);

    this.state = {
      selectedMembers: this.generateMembersParams(props.selectedMembers)
    };
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.channel
    );
  }

  collectValues(items) {
    return items.map(item => item.value);
  }

  generateMembersParams(members) {
    return members.map(member => ({
      value: member._id,
      label: (member.details && member.details.fullName) || ''
    }));
  }

  generateDoc() {
    return {
      doc: {
        name: document.getElementById('channel-name').value,
        description: document.getElementById('channel-description').value,
        memberIds: this.collectValues(this.state.selectedMembers)
      }
    };
  }

  renderContent() {
    const { __ } = this.context;
    const { members, channel } = this.props;

    const object = channel || { memberIds: [] };
    const self = this;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="channel-name"
            defaultValue={object.name}
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
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Members</ControlLabel>

          <Select
            placeholder={__('Choose members')}
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

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.channel || {})}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="close"
            onClick={onClick}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checkmark" type="submit">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

ChannelForm.propTypes = propTypes;
ChannelForm.contextTypes = contextTypes;

export default ChannelForm;
