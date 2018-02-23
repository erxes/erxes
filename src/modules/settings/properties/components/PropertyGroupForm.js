import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Toggle from 'react-toggle';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

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

    if (props.group) {
      action = props.edit;
    }

    this.state = {
      name: '',
      description: '',
      visible: true,
      action
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.visibleHandler = this.visibleHandler.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.group) {
      const { group } = nextProps;

      this.setState({
        name: group.name || '',
        description: group.description || '',
        visible: group.visible
      });
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const { name, description, visible } = this.state;

    const doc = {
      name,
      order: 1,
      description,
      visible
    };

    this.state.action(
      this.props.group ? { _id: this.props.group._id, doc } : { doc }
    );

    this.context.closeModal();
  }

  onChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      [name]: value
    });
  }

  visibleHandler(e) {
    const visible = e.target.checked;

    this.setState({ visible });
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            name="name"
            autoFocus
            required
            value={this.state.name}
            onChange={e => this.onChange(e)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            name="description"
            required
            value={this.state.description}
            onChange={e => this.onChange(e)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Visible</ControlLabel>
          <div>
            <Toggle
              checked={this.state.visible}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
              onChange={this.visibleHandler}
            />
          </div>
        </FormGroup>

        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

PropertyGroupForm.propTypes = propTypes;
PropertyGroupForm.contextTypes = contextTypes;

export default PropertyGroupForm;
