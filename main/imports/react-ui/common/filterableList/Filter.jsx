import React, { PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';


const propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

function Filter({ placeholder = 'Search ...', onChange }) {
  return (
    <FormControl
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      autoFocus
    />
  );
}

Filter.propTypes = propTypes;

export default Filter;
