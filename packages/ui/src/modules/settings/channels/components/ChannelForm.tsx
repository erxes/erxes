import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import { IChannel } from '../types';

type Props = {
  channel?: IChannel;
  selectedMembers: string[];
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { channel } = this.props;
    const finalValues = values;

    if (channel) {
      finalValues._id = channel._id;
    }

    return {
      ...finalValues,
      memberIds: this.state.selectedMembers
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, channel, renderButton, selectedMembers } = this.props;
    const { values, isSubmitted } = formProps;

    const object = channel || ({} as IChannel);
    const self = this;

    const onChange = items => {
      self.setState({ selectedMembers: items });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            autoFocus={true}
            defaultValue={object.name}
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
            initialValue={selectedMembers}
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

          {renderButton({
            name: 'channel',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: channel
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ChannelForm;
