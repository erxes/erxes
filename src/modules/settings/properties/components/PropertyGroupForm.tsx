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

type Props = {
  add: ({ doc }: { doc: any; }) => void,
  edit: ({ _id, doc }: { _id: string, doc: any; }) => void,
  group?: IFieldGroup,
  closeModal: () => void
};

type State = {
  isVisible: boolean,
  action: (params: {_id?: string, doc: any}) => void
}

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

    this.onSubmit = this.onSubmit.bind(this);
    this.visibleHandler = this.visibleHandler.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    const { isVisible } = this.state;
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const description = (document.getElementById('description') as HTMLInputElement).value;

    const doc = {
      name,
      description,
      isVisible
    };

    this.state.action(
      this.props.group ? { _id: this.props.group._id, doc } : { doc }
    );

    this.props.closeModal();
  }

  visibleHandler(e) {
    const isVisible = e.target.checked;

    this.setState({ isVisible });
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
            autoFocus
            required
            defaultValue={group.name || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            id="description"
            required
            defaultValue={group.name || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Visible</ControlLabel>
          <div>
            <Toggle
              checked={this.state.isVisible}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
              onChange={this.visibleHandler}
            />
          </div>
        </FormGroup>

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
