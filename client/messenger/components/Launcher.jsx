import React, { PropTypes } from 'react';
import classNames from 'classnames';


const propTypes = {
  onClick: PropTypes.func.isRequired,
  notificationCount: PropTypes.number.isRequired,
  isMessengerVisible: PropTypes.bool.isRequired,
  color: PropTypes.string,
};

function Launcher({ isMessengerVisible, onClick, notificationCount, color }) {
  const clickHandler = () => {
    onClick(isMessengerVisible);
  };

  const launcherClasses = classNames('erxes-launcher', {
    close: isMessengerVisible,
  });

  return (
    <div
      className={launcherClasses}
      onClick={clickHandler}
      style={{ backgroundColor: color }}
    >
      {notificationCount ? <span>{notificationCount}</span> : null}
    </div>
  );
}

Launcher.propTypes = propTypes;

Launcher.defaultProps = {
  color: null,
};

export default Launcher;
