import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { IUserGroup, IUserGroupDocument } from '../types';

type Props = {
  save: ({ doc: IUserGroup }, callback: () => void, object: any) => void;
  closeModal: () => void;
  object: { _id: string } & IUserGroup;
};

class GroupForm extends React.Component<Props> {
  generateDoc() {
    return {
      name: (document.getElementById('group-name') as HTMLInputElement).value,
      description: (document.getElementById(
        'group-description'
      ) as HTMLInputElement).value
    };
  }

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const doc = this.generateDoc();

    if (!doc.name || doc.name.length === 0) {
      return Alert.error('Please enter a group name');
    }

    if (!doc.description || doc.description.length === 0) {
      return Alert.error('Please enter a group description');
    }

    this.props.save({ doc }, this.props.closeModal, this.props.object);
  };

  renderContent() {
    const object = this.props.object || ({} as IUserGroupDocument);
    const name = object.name || '';
    const description = object.description || '';

    return (
      <>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="group-name" defaultValue={name} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl id="group-description" defaultValue={description} />
        </FormGroup>
      </>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
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
      </form>
    );
  }
}

export default GroupForm;
