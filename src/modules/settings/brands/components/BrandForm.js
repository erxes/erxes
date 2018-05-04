import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';

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

    this.save = this.save.bind(this);
  }

  save(doc) {
    this.props.save(
      {
        doc: {
          name: doc.name,
          description: doc.description
        }
      },
      () => {
        this.context.closeModal();
      },
      this.props.brand
    );
  }

  renderContent() {
    const object = this.props.brand || {};

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            name="name"
            validations="isValue"
            validationError="Please enter a name"
            value={object.name}
            type="text"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            name="description"
            validations="isValue"
            validationError="Please enter a description"
            componentClass="textarea"
            rows={5}
            value={object.description}
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
      <Form onSubmit={this.save}>
        {this.renderContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={onClick}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checked-1" type="submit">
            Save
          </Button>
        </ModalFooter>
      </Form>
    );
  }
}

BrandForm.propTypes = propTypes;
BrandForm.contextTypes = contextTypes;

export default BrandForm;
