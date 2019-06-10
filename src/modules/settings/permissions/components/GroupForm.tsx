import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { SelectTeamMembers } from 'modules/settings/team/containers';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { mutations } from '../graphql';
import { IUserGroup, IUserGroupDocument } from '../types';

type Props = {
  closeModal: () => void;
  object: { _id: string } & IUserGroup;
  refetch: any;
};

type State = {
  selectedMembers: string[];
  isSubmitted: boolean;
};

class GroupForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: (props.object && props.object.memberIds) || [],
      isSubmitted: false
    };
  }

  save = () => {
    this.setState({ isSubmitted: true });
  };

  getMutation = () => {
    if (this.props.object) {
      return mutations.usersGroupsEdit;
    }

    return mutations.usersGroupsAdd;
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      description: finalValues.description,
      memberIds: this.state.selectedMembers
    };
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
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            componentClass="textarea"
            name="description"
            defaultValue={object.description || ''}
            required={true}
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

          <ButtonMutate
            mutation={this.getMutation()}
            variables={this.generateDoc(formProps.values)}
            callback={this.props.closeModal}
            refetchQueries={this.props.refetch}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            icon="checked-1"
            successMessage={`You successfully ${
              object ? 'updated' : 'added'
            } a user group.`}
          >
            {__('Save')}
          </ButtonMutate>
        </Modal.Footer>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.save} />;
  }
}

export default GroupForm;
