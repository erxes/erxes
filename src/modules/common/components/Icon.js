import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const IconStyle = styled.i`
  margin-right: 4px;
  margin-left: 1px;
  font-size: ${props => (props.size ? `${props.size}px` : 'inherit')};
`;

function Icon({ icon, size }) {
  return <IconStyle className={`ion-${icon}`} size={size} />;
}

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number
};

export default Icon;
