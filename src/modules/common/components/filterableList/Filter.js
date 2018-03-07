import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'modules/common/components';

const propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

function Filter({ placeholder = 'Search ...', onChange }, { __ }) {
  return (
    <FormControl
      type="text"
      placeholder={__(placeholder)}
      onChange={onChange}
      autoFocus
    />
  );
}

Filter.propTypes = propTypes;
Filter.contextTypes = {
  __: PropTypes.func
};

export default Filter;
