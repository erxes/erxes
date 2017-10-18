import React from "react";
import PropTypes from "prop-types";

// const IconStyle = styled.icon`${props => css}`
// 	marginRight: '0.4em'
// `}`;

function Icon({ icon }) {
  const className = `ion-${icon}`;

   return (
    <i className={className}></i>
   );
}

Icon.propTypes = {
  icon: PropTypes.node.isRequired,
};

export default Icon;
