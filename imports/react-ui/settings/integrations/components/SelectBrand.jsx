import React, { PropTypes } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';

const SelectBrand = ({ brands, onChange }) => (
  <FormGroup controlId="selectBrand">
    <ControlLabel>Brand</ControlLabel>

    <FormControl
      componentClass="select"
      placeholder="Select Brand"
      onChange={onChange}
    >

      {brands.map(brand =>
        <option key={brand._id} value={brand._id}>{brand.name}</option>
      )}
    </FormControl>
  </FormGroup>
);

SelectBrand.propTypes = {
  brands: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

export default SelectBrand;
