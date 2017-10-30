import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Formgroup = styled.div`
  margin-bottom: 20px;
`;

function FormGroup({ children }) {
  return <Formgroup>{children}</Formgroup>;
}

FormGroup.propTypes = {
  children: PropTypes.node.isRequired
};

export default FormGroup;
