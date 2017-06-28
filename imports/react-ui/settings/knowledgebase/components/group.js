import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import SelectBrand from './SelectBrand';

class KbGroup extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const group = this.props.group || {};

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="integration-name">
          <ControlLabel>Name</ControlLabel>
          <FormControl type="text" defaultValue={group.title} required />
        </FormGroup>

        <SelectBrand
          brands={this.props.brands}
          defaultValue={group.brandId}
          onChange={this.handleBrandChange}
        />
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      title: document.getElementById('title').value,
      brandId: document.getElementById('selectBrand').value,
    });
  }
}

export default KbGroup;
