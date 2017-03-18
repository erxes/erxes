import React, { PropTypes } from 'react';

const propTypes = {
  onClick: PropTypes.func.isRequired,
  isFormVisible: PropTypes.bool.isRequired,
};

function Launcher({ isFormVisible, onClick }) {
  const clickHandler = () => {
    onClick(isFormVisible);
  };

  return (
    <div className="shoutbox-launcher" onClick={clickHandler} />
  );
}

Launcher.propTypes = propTypes;

export default Launcher;
