import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { SelectTeamMembers } from 'modules/settings/team/containers';
import * as React from 'react';
import { mutations } from '../graphql';
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
  refetchQueries: any;
};

type State = {
  selectedMembers: string[];
  isSubmitted: boolean;
};

class ChannelForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: props.selectedMembers || [],
      isSubmitted: false
    };
  }

  save = () => {
    this.setState({ isSubmitted: true });
  };

  getMutation = () => {
    if (this.props.channel) {
      return mutations.channelEdit;
    }

    return mutations.channelAdd;
  };

  generateDoc = (values: { name: string; description: string }) => {
    return {
      doc: {
        name: values.name,
        description: values.description,
        memberIds: this.state.selectedMembers
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, channel, refetchQueries } = this.props;

    const object = channel || { name: '', description: '' };
    const self = this;
    const finalValues = formProps.values;

    const onChange = items => {
      self.setState({ selectedMembers: items });
    };

    if (channel) {
      finalValues._id = channel._id;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            {...formProps}
            name="description"
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
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          <ButtonMutate
            mutation={this.getMutation()}
            variables={finalValues}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            icon="checked-1"
            successMessage={`You successfully ${
              channel ? 'updated' : 'added'
            } a brand.`}
          >
            {__('Save')}
          </ButtonMutate>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.save} />;
  }
}

export default ChannelForm;
