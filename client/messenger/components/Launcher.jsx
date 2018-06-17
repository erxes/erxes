import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { UnreadCount } from '../containers';

const propTypes = {
  onClick: PropTypes.func.isRequired,
  isMessengerVisible: PropTypes.bool.isRequired,
  isBrowserInfoSaved: PropTypes.bool,
  uiOptions: PropTypes.object,
};

function Launcher({ isMessengerVisible, isBrowserInfoSaved, onClick, uiOptions }) {
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
        color: color,
        backgroundImage: `url(${logo || defaultLogo})`,
        backgroundSize: logo ? '' : '20px',
      }}
    >
      { isBrowserInfoSaved && <UnreadCount /> }
    </div>
  );
}

Launcher.propTypes = propTypes;

Launcher.defaultProps = {
  uiOptions: null,
};

export default Launcher;
