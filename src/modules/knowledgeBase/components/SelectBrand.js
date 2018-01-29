import React from 'react';
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

const SelectBrand = ({ brands, onChange, defaultValue }) => (
  <FormGroup>
    <ControlLabel>Brand</ControlLabel>

    <FormControl
      id="selectBrand"
      componentClass="select"
      placeholder="Select Brand"
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

export default SelectBrand;
