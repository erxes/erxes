import { IIntegration } from 'modules/settings/integrations/types';
import React from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from '../../../common/components';
import { ModalFooter } from '../../../common/styles/main';
import { __ } from '../../../common/utils';
import { IBrand, IChooseBrand } from '../types';

type Props = {
  brands: IBrand[];
  integration: IIntegration;
  save: (variables: IChooseBrand) => void;
  closeModal?: () => void;
};

class ChooseBrand extends React.Component<Props> {
  updateInstallCodeValue(brandId) {
    if (brandId) {
      this.props.brands.find(brand => brand._id === brandId);
    }
  }

  handleBrandChange = e => {
    this.updateInstallCodeValue(e.target.value);
  };

  handleSubmit = e => {
    e.preventDefault();

    if (this.props.closeModal) {
      this.props.closeModal();
    }

    this.props.save({
      name: (document.getElementById('integration-name') as HTMLInputElement)
        .value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value
    });
  };

  render() {
    const integration = this.props.integration;

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            id="integration-name"
            type="text"
            defaultValue={integration.name}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Brand</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue={integration.brandId}
            onChange={this.handleBrandChange}
            id="selectBrand"
          >
            <option />
            {this.props.brands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>
          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default ChooseBrand;
