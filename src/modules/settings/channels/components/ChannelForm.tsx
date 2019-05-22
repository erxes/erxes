import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { SelectTeamMembers } from 'modules/settings/team/containers';
import * as React from 'react';
import { IChannel } from '../types';

type Props = {
  channel?: IChannel;
  selectedMembers: string[];
  closeModal: () => void;
  save: (
    params: {
      doc: {
        name: string;
        description: string;
        memberIds: string[];
      };
    },
    callback: () => void,
    channel?: IChannel
  ) => void;
};

type State = {
  selectedMembers: string[];
};

class ChannelForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: props.selectedMembers || []
    };
  }

  save = e => {
    e.preventDefault();

    const { save, channel, closeModal } = this.props;

    save(this.generateDoc(), () => closeModal(), channel);
  };

  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('channel-name') as HTMLInputElement)
          .value,
        description: (document.getElementById(
          'channel-description'
        ) as HTMLInputElement).value,
        memberIds: this.state.selectedMembers
      }
    };
  };

  renderContent() {
    const { channel } = this.props;

    const object = channel || { name: '', description: '' };
    const self = this;

    const onChange = items => {
      // tslint:disable
      console.log(items);
      self.setState({ selectedMembers: items });
    };

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="channel-name"
            defaultValue={object.name}
            type="text"
            required={true}
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

          <SelectTeamMembers
            label="Choose members"
            name="selectedMembers"
            value={self.state.selectedMembers}
            onSelect={onChange}
          />
        </FormGroup>
      </React.Fragment>
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
