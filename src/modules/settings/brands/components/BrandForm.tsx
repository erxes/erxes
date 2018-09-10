import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { IBrand } from "../types";

type Props = {
  brand: IBrand,
  save: (params: { doc: { name: string; description: string }}, callback: () => void, brand: IBrand) => void,
}

class BrandForm extends Component<Props, {}> {
  static contextTypes =  {
    closeModal: PropTypes.func.isRequired
  }

  constructor(props: Props) {
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
        name: (document.getElementById('brand-name') as HTMLInputElement).value,
        description: (document.getElementById('brand-description') as HTMLInputElement).value,
      }
    };
  }

  renderContent() {
    const object = this.props.brand;

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
            icon="cancel-1"
            onClick={onClick}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checked-1" type="submit">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default BrandForm;
