import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React, { Component, Fragment } from 'react';
import Select from 'react-select-plus';
import { IChannel } from "../types";

type Props = {
  channel?: IChannel;
  members: IUser[];
  selectedMembers: IUser[];
  closeModal: () => void;
  save: ({ doc }: { doc: any; }, callback: () => void, channel?: IChannel) => void;
};

type State = {
  selectedMembers: IUser[],
};

class ChannelForm extends Component<Props, State> {
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

    const { save, channel, closeModal } = this.props;

    save(this.generateDoc(), () => closeModal(), channel);
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

    const object = channel || { name: '', description: '' };
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
    const { closeModal } = this.props;

    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
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
