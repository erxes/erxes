import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import Select from 'react-select-plus';
import { IChannel } from "../types";

type Props = {
  channel: IChannel,
  members: IUser[],
  selectedMembers: IUser[],
  save: (params: { 
    doc: { name: string; description: string, memberIds: string[] }}, 
    callback: () => void, channel: IChannel) => void,
};

type State = {
  selectedMembers: () => void,
};

class ChannelForm extends Component<Props, State> {
  static contextTypes =  {
    closeModal: PropTypes.func.isRequired,
  }

  constructor(props: Props) {
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
        name: (document.getElementById('channel-name') as HTMLInputElement).value,
        description: (document.getElementById('channel-description') as HTMLInputElement).value,
        memberIds: this.collectValues(this.state.selectedMembers)
      }
    };
  }

  renderContent() {
    const { members, channel } = this.props;

    const object = channel;
    const self = this;

    return (
      <Fragment>
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
      </Fragment>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
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
      </form>
    );
  }
}

export default ChannelForm;
