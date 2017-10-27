import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const IconStyle = styled.i`
  margin-right: 4px;
  margin-left: 1px;
  font-size: ${props => props.size}px;
`;

function Icon({ icon, size }) {
  return <IconStyle className={`ion-${icon}`} size={size} />;
}

Icon.propTypes = {
  icon: PropTypes.node.isRequired,
  size: PropTypes.string
};

Icon.defaultProps = {
  size: 13
};

export default Icon;
