import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IBrand } from '../../settings/brands/types';

type Props = {
  brands: IBrand[];
  onChange: () => void;
  defaultValue: string;
};

const SelectBrand = ({ brands, onChange, defaultValue }: Props) => (
  <FormGroup>
    <ControlLabel>Brand</ControlLabel>

    <FormControl
      id="selectBrand"
      componentClass="select"
      placeholder={__('Select Brand')}
      defaultValue={defaultValue}
      onChange={onChange}
    >
      <option />
      {brands.map(brand => (
        <option key={brand._id} value={brand._id}>
          {brand.name}
        </option>
      ))}
    </FormControl>
  </FormGroup>
);

export default SelectBrand;
