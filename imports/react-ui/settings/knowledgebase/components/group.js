import React, { Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
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

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
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
