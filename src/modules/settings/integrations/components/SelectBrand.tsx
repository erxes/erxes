import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IBrand } from '../../brands/types';

const SelectBrand = ({ brands, onChange, defaultValue }: Props) => (
  <FormGroup>
    <ControlLabel>Brand</ControlLabel>

    <FormControl
      componentClass="select"
      placeholder={__('Select Brand')}
      defaultValue={defaultValue}
      onChange={onChange}
      id="selectBrand"
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

type Props = {
  brands: IBrand[], // eslint-disable-line react/forbid-prop-types
  onChange?: (e: any) => any,
  defaultValue?: string
};

export default SelectBrand;
