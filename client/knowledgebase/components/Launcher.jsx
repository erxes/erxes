import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
  // onClick: PropTypes.func.isRequired,
};

function Launcher() {
  // const clickHandler = () => {
  //   onClick(isMessengerVisible);
  // };

  const launcherClasses = classNames('erxes-launcher', {
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

Launcher.defaultProps = {
};

export default Launcher;
