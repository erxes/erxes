import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'modules/common/components';

const propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired
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
