import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Modal,
  Button,
} from 'react-bootstrap';

const propTypes = {
  brand: PropTypes.object,
  saveBrand: PropTypes.func,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class BrandForm extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.saveBrand(
      {
        doc: {
          name: document.getElementById('brand-name').value,
          description: document.getElementById('brand-description').value,
        },
      },
      () => {
        this.context.closeModal();
      },
      this.props.brand,
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const brand = this.props.brand || {};

    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="brand-name" type="text" defaultValue={brand.name} required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="brand-description"
            componentClass="textarea"
            defaultValue={brand.description}
            required
            rows={5}
          />
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button bsStyle="link" onClick={onClick}>Cancel</Button>
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

BrandForm.propTypes = propTypes;
BrandForm.contextTypes = contextTypes;

export default BrandForm;
