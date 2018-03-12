import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
  onClick: PropTypes.func.isRequired,
  notificationCount: PropTypes.number.isRequired,
  isMessengerVisible: PropTypes.bool.isRequired,
  uiOptions: PropTypes.object,
};

function Launcher({
  isMessengerVisible,
  onClick,
  notificationCount,
  uiOptions,
}) {
  const clickHandler = () => {
    onClick(isMessengerVisible);
  };

  const launcherClasses = classNames('erxes-launcher', {
    close: isMessengerVisible,
  });

  const { color, logo } = uiOptions;
  const defaultLogo = '/static/images/widget-logo.png';

  return (
    <div
      className={launcherClasses}
      onClick={clickHandler}
      style={{
        backgroundColor: color,
        backgroundImage: `url(${logo || defaultLogo})`,
        backgroundSize: logo ? '' : '20px',
      }}
    >
      {notificationCount ? <span>{notificationCount}</span> : null}
    </div>
  );
}

Launcher.propTypes = propTypes;

Launcher.defaultProps = {
  uiOptions: null,
};

export default Launcher;
