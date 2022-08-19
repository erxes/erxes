import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { IBrand } from '@erxes/ui/src/brands/types';

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
