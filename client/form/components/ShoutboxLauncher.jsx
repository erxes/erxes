import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
  onClick: PropTypes.func.isRequired,
  isFormVisible: PropTypes.bool.isRequired,
};

function Launcher({ isFormVisible, onClick }) {
  const clickHandler = () => {
    onClick(isFormVisible);
  };

  const launcherClasses = classNames('shoutbox-launcher', {
    'close': isFormVisible
  });

  return (
    <div className={launcherClasses} onClick={clickHandler} />
  );
}

Launcher.propTypes = propTypes;

export default Launcher;
