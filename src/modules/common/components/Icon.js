import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const IconStyle = styled.i`
  font-size: ${props => (props.size ? `${props.size}px` : 'inherit')};
  color: ${props => props.color && props.color};
`;

function Icon(props) {
  const { isActive } = props;

  let color;

  if (isActive) {
    color = 'black';
  }

  return (
    <IconStyle {...props} className={`icon-${props.icon}`} color={color} />
  );
}

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
  isActive: PropTypes.bool
};

export default Icon;
