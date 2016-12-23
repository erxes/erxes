import React, { PropTypes } from 'react';


const propTypes = {
  onClick: PropTypes.func.isRequired,
  notificationCount: PropTypes.number.isRequired,
  isMessengerVisible: PropTypes.bool.isRequired,
};

function Launcher({ isMessengerVisible, onClick, notificationCount }) {
  const clickHandler = () => {
    onClick(isMessengerVisible);
  };

  return (
    <div className="erxes-launcher" onClick={clickHandler}>
      {notificationCount ? <span>{notificationCount}</span> : null}
    </div>
  );
}

Launcher.propTypes = propTypes;

export default Launcher;
