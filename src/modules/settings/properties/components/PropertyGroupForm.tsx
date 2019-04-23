import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import * as React from 'react';
import Toggle from 'react-toggle';
import { IFieldGroup } from '../types';

type Doc = {
  name: string;
  description: string;
  isVisible: boolean;
};

type Props = {
  add: ({ doc }: { doc: Doc }) => void;
  edit: ({ _id, doc }: { _id: string; doc: Doc }) => void;

  group?: IFieldGroup;
  closeModal: () => void;
};

type State = {
  isVisible: boolean;
  action: (params: { _id?: string; doc: Doc }) => void;
};

class PropertyGroupForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let action = props.add;
    let isVisible = true;

    if (props.group) {
      action = props.edit;
      isVisible = props.group.isVisible;
    }

    this.state = {
      isVisible,
      action
    };
  }

  onSubmit = e => {
    e.preventDefault();

    const { isVisible } = this.state;
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const description = (document.getElementById(
      'description'
    ) as HTMLInputElement).value;

    const doc = {
      name,
      description,
      isVisible
    };

    this.state.action(
      this.props.group ? { _id: this.props.group._id, doc } : { doc }
    );

    this.props.closeModal();
  };

  visibleHandler = e => {
    const isVisible = e.target.checked;

    this.setState({ isVisible });
  };

  renderFieldVisible() {
    if (!this.props.group) {
      return;
    }

    return (
      <FormGroup>
        <ControlLabel>Visible</ControlLabel>
        <div>
          <Toggle
            checked={this.state.isVisible}
            onChange={this.visibleHandler}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  render() {
    const { group = { name: '' } } = this.props;

    return (
      <form onSubmit={this.onSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            id="name"
            autoFocus={true}
            required={true}
            defaultValue={group.name || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            id="description"
            required={true}
            defaultValue={group.name || ''}
          />
        </FormGroup>

        {this.renderFieldVisible()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default PropertyGroupForm;
