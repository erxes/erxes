import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

const propTypes = {
  add: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class PropertyGroupForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: ''
    };

    this.onChange = this.onChange.bind(this);
    this.addGroup = this.addGroup.bind(this);
  }

  addGroup(e) {
    e.preventDefault();
    const { name, description } = this.state;

    this.props.add({
      doc: {
        name,
        contentType: 'Customer',
        order: 1,
        description
      },

      callback: () => {
        this.setState({ name: '', description: '' });
        this.context.closeModal();
      }
    });
  }

  onChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <form onSubmit={e => this.addCompany(e)}>
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

          <Button
            btnStyle="success"
            type="submit"
            icon="checkmark"
            onClick={this.addGroup}
          >
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
