import * as React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '../../../common/components';
import { __ } from '../../../common/utils';
import { IBrand } from '../../brands/types';

type Props = {
  brands: IBrand[]; // eslint-disable-line react/forbid-prop-types
  onChange?: (e: any) => any;
  defaultValue?: string;
};

const SelectBrand = ({ brands, onChange, defaultValue }: Props) => (
  <FormGroup>
    <ControlLabel required={true}>Brand</ControlLabel>

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

export default SelectBrand;
