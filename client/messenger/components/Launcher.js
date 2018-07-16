import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Notifier } from '../containers';

function Launcher(props) {
  const {
    isMessengerVisible,
    isBrowserInfoSaved,
    onClick,
    uiOptions,
    lastUnreadMessage,
    totalUnreadCount,
  } = props;

  const clickHandler = () => {
    onClick(isMessengerVisible);
  };

  const launcherClasses = classNames('erxes-launcher', {
    close: isMessengerVisible,
  });

  const { color, logo } = uiOptions;

  const renderNotifier = () => {
    if (!isBrowserInfoSaved || isMessengerVisible) {
      return null;
    }

    return <Notifier message={lastUnreadMessage} />
  }

  const renderUnreadCount = () => {
    if (!isBrowserInfoSaved || !totalUnreadCount) {
      return null;
    }

    return <span>{totalUnreadCount}</span>
  }

  return (
    <div>
      <div
        className={launcherClasses}
        onClick={clickHandler}
        style={{
          backgroundColor: color,
          color: color,
          backgroundImage: logo ? `url(${logo})` : '',
          backgroundSize: logo ? '' : '20px',
        }}
      >
        {renderUnreadCount()}
      </div>

      {renderNotifier()}
    </div>
  );
}

Launcher.propTypes = {
  onClick: PropTypes.func.isRequired,
  isMessengerVisible: PropTypes.bool.isRequired,
  isBrowserInfoSaved: PropTypes.bool,
  uiOptions: PropTypes.object,
  lastUnreadMessage: PropTypes.object,
  totalUnreadCount: PropTypes.number,
};

Launcher.defaultProps = {
  uiOptions: null,
};

export default Launcher;
