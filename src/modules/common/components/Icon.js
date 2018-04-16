import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const IconStyle = styled.i`
  font-size: ${props => (props.size ? `${props.size}px` : 'inherit')};
`;

function Icon({ ...props }) {
  return (
    <IconStyle
      {...props}
      className={props.erxes ? `icon-${props.icon}` : `ion-${props.icon}`}
    />
  );
}

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
  erxes: PropTypes.bool
};

export default Icon;
