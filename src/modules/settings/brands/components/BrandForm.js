import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  brand: PropTypes.object,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class BrandForm extends Component {
  constructor(props) {
    super(props);

    this.generateDoc = this.generateDoc.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.brand
    );
  }

  generateDoc() {
    return {
      doc: {
        name: document.getElementById('brand-name').value,
        description: document.getElementById('brand-description').value
      }
    };
  }

  renderContent() {
    const object = this.props.brand || {};

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="brand-name"
            defaultValue={object.name}
            type="text"
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="brand-description"
            componentClass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="close"
            onClick={onClick}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checkmark" type="submit">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

BrandForm.propTypes = propTypes;
BrandForm.contextTypes = contextTypes;

export default BrandForm;
