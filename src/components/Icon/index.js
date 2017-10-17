import React from "react";
import PropTypes from "prop-types";

function Icon({ icon }) {
  const i = `ion-${icon}`;

  return (
    <i className={i} style={{marginRight: '0.4em'}}></i>
  );
}

Icon.propTypes = {
  icon: PropTypes.node.isRequired,
};

export default Icon;
