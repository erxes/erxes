import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
  isLauncherVisible: PropTypes.bool,
};

function Launcher({ isLauncherVisible }) {
  // const clickHandler = () => {
  //   onClick(isMessengerVisible);
  // };

  const launcherClasses = classNames('erxes-launcher', {
    close: !isLauncherVisible,
  });

  // const { color, logo } = uiOptions;
  const defaultLogo = '/static/images/widget-logo.png';

  return (
    <div
      className={launcherClasses}
      style={{ backgroundColor: 'rgb(121, 38, 109)', backgroundImage: `url(${defaultLogo })` }}
    />
  );
}

Launcher.propTypes = propTypes;

Launcher.defaultProps = {};

export default Launcher;
