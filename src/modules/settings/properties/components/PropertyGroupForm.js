import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';

const propTypes = {
  add: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  group: PropTypes.object
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class PropertyGroupForm extends React.Component {
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
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;

    const doc = {
      name,
      description,
      isVisible
    };

    this.state.action(
      this.props.group ? { _id: this.props.group._id, doc } : { doc }
    );

    this.context.closeModal();
  }

  visibleHandler(e) {
    const isVisible = e.target.checked;

    this.setState({ isVisible });
  }

  render() {
    const { group = {} } = this.props;

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
            onClick={() => {
              this.context.closeModal();
            }}
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

PropertyGroupForm.propTypes = propTypes;
PropertyGroupForm.contextTypes = contextTypes;

export default PropertyGroupForm;
