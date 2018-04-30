import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
  onClick: PropTypes.func.isRequired,
  isFormVisible: PropTypes.bool.isRequired,
  color: PropTypes.string
};

function Launcher({ isFormVisible, onClick, color }) {
  const clickHandler = () => {
    onClick(isFormVisible);
  };

  const launcherClasses = classNames('erxes-launcher', {
    'close-launcher': isFormVisible
  });

  return (
    <div style={{ backgroundColor: color }} className={launcherClasses} onClick={clickHandler} />
  );
}

Launcher.propTypes = propTypes;

export default Launcher;
