import React from "react";
import PropTypes from "prop-types";

function Icon({ icon }) {
  return (
    <i className={`ion-${icon}`}></i>
  );
}

Icon.propTypes = {
  icon: PropTypes.node.isRequired,
};

export default Icon;
