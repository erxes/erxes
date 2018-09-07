import * as React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';

const propTypes = {
  brands: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

const SelectBrand = ({ brands, onChange, defaultValue }, { __ }) => (
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

SelectBrand.propTypes = propTypes;
SelectBrand.contextTypes = contextTypes;

export default SelectBrand;
