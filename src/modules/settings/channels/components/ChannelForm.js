import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';

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

  save(doc) {
    this.props.save(
      this.generateDoc(doc),
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

  generateDoc(doc) {
    return {
      doc: {
        name: doc.channelName,
        description: doc.channelDescription,
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
      <Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            name="channelName"
            value={object.name}
            type="text"
            validations="isValue"
            validationError="Please enter a name"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            name="channelDescription"
            componentClass="textarea"
            validations={{}}
            rows={5}
            value={object.description}
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
      </Fragment>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <Form onSubmit={this.save}>
        {this.renderContent(this.props.channel || {})}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={onClick}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checked-1" type="submit">
            Save
          </Button>
        </ModalFooter>
      </Form>
    );
  }
}

ChannelForm.propTypes = propTypes;
ChannelForm.contextTypes = contextTypes;

export default ChannelForm;
