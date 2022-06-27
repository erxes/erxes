import { IBrand, IChooseBrand } from '../types';

import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import { ModalFooter } from '../../../common/styles/main';
import React from 'react';
import { __ } from '../../../common/utils';

type Props = {
  brands: IBrand[];
  integration: any; //check
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
            icon="times-circle"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>
          <Button btnStyle="success" type="submit" icon="check-circle">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default ChooseBrand;
