import ButtonMutate from 'modules/common/components/ButtonMutate';
import * as React from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from '../../../common/components';
import { ModalFooter } from '../../../common/styles/main';
import { mutations, queries } from '../graphql';
import { IBrand } from '../types';

type Props = {
  brand?: IBrand;
  closeModal: () => void;
  refetchQueries: any;
};

class BrandForm extends React.Component<Props, { isSubmitted: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSubmitted: false
    };
  }

  generateDocs = () => {
    return {
      _id: this.props.brand && this.props.brand._id,
      name: (document.getElementById('brand-name') as HTMLInputElement).value,
      description: (document.getElementById(
        'brand-description'
      ) as HTMLInputElement).value
    };
  };

  submitForm = e => {
    e.preventDefault();

    this.setState({ isSubmitted: true });
  };

  renderContent() {
    const object = this.props.brand || ({} as IBrand);

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="brand-name"
            defaultValue={object.name}
            type="text"
            required={true}
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

  getMutation = () => {
    if (this.props.brand) {
      return mutations.brandEdit;
    }

    return mutations.brandAdd;
  };

  render() {
    return (
      <form onSubmit={this.submitForm}>
        {this.renderContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>

          <ButtonMutate
            mutation={this.getMutation()}
            getVariables={this.generateDocs}
            callback={this.props.closeModal}
            refetchQueries={this.props.refetchQueries}
            isSubmitted={this.state.isSubmitted}
            icon="checked-1"
            successMessage={`You successfully ${
              this.props.brand ? 'updated' : 'added'
            } a brand.`}
          >
            Save
          </ButtonMutate>
        </ModalFooter>
      </form>
    );
  }
}

export default BrandForm;
