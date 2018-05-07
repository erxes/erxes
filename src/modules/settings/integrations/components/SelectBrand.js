import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';

const SelectBrand = ({ brands, onChange, value }, { __ }) => (
  <FormGroup>
    <ControlLabel>Brand</ControlLabel>

    <FormControl
      componentClass="select"
      placeholder={__('Select Brand')}
      value={value}
      onChange={onChange}
      name="selectBrand"
      validations="isValue"
      validationError="Please select a brand"
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

SelectBrand.propTypes = {
  brands: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func,
  value: PropTypes.string
};

SelectBrand.contextTypes = {
  __: PropTypes.func
};

export default SelectBrand;
