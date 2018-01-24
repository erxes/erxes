import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import SelectBrand from '../../integrations/components/SelectBrand';

class Messenger extends Component {
  constructor(props) {
    super(props);

    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  updateInstallCodeValue(brandId) {
    if (brandId) {
      this.props.brands.find(brand => brand._id === brandId);
    }
  }

  handleBrandChange(e) {
    this.updateInstallCodeValue(e.target.value);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      name: document.getElementById('integration-name').value,
      brandId: document.getElementById('selectBrand').value
    });
  }

  render() {
    const integration = this.props.integration || {};

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            id="integration-name"
            type="text"
            defaultValue={integration.name}
            required
          />
        </FormGroup>

        <SelectBrand
          brands={this.props.brands}
          defaultValue={integration.brandId}
          onChange={this.handleBrandChange}
        />
        <Modal.Footer>
          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

Messenger.propTypes = {
  brands: PropTypes.array.isRequired,
  integration: PropTypes.object,
  save: PropTypes.func.isRequired
};

Messenger.contextTypes = {
  closeModal: PropTypes.func.isRequired
};

export default Messenger;
