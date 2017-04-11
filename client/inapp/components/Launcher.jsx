import React, { PropTypes } from 'react';


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

  return (
    <div className="erxes-launcher" onClick={clickHandler} style={{ backgroundColor: color }}>
      {notificationCount ? <span>{notificationCount}</span> : null}
    </div>
  );
}

Launcher.propTypes = propTypes;

export default Launcher;
