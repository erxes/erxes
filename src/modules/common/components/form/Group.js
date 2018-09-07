import * as React from 'react';
import PropTypes from 'prop-types';
import { Formgroup } from './styles';

function FormGroup({ children }) {
  return <Formgroup>{children}</Formgroup>;
}

FormGroup.propTypes = {
  children: PropTypes.node.isRequired
};

export default FormGroup;
