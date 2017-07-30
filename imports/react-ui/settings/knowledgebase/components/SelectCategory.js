import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

const SelectCategory = ({ categories, defaultValue }) => (
  <FormGroup controlId="selectCategory">
    <ControlLabel>Category</ControlLabel>

    <FormControl componentClass="select" placeholder="Select Category" defaultValue={defaultValue}>
      <option />
      {categories.map(category => (
        <option key={category._id} value={category._id}>{category.title}</option>
      ))}
    </FormControl>
  </FormGroup>
);

SelectCategory.propTypes = {
  categories: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultValue: PropTypes.string,
};

export default SelectCategory;
