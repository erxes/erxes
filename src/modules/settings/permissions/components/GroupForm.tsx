import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { IFormProps } from 'modules/common/types';
import { SelectTeamMembers } from 'modules/settings/team/containers';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { IUserGroup, IUserGroupDocument } from '../types';

type Props = {
  save: ({ doc: IUserGroup }, callback: () => void, object: any) => void;
  closeModal: () => void;
  object: { _id: string } & IUserGroup;
};

type State = {
  selectedMembers: string[];
};

class GroupForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: (props.object && props.object.memberIds) || []
    };
  }

  generateDoc() {
    return {
      name: (document.getElementById('group-name') as HTMLInputElement).value,
      description: (document.getElementById(
        'group-description'
      ) as HTMLInputElement).value,
      memberIds: this.state.selectedMembers
    };
  }

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const doc = this.generateDoc();

    this.props.save({ doc }, this.props.closeModal, this.props.object);
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IUserGroupDocument);
    const self = this;

    const onChange = selectedMembers => {
      self.setState({ selectedMembers });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name || ''}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            componentClass="textarea"
            name="description"
            defaultValue={object.description || ''}
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

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </Modal.Footer>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.save} />;
  }
}

export default GroupForm;
