import React, { PropTypes } from 'react';


const propTypes = {
  onClick: PropTypes.func.isRequired,
  notificationCount: PropTypes.number.isRequired,
};

function Launcher({ onClick, notificationCount }) {
  return (
    <div className="erxes-launcher" onClick={onClick}>
      {notificationCount ? <span>{notificationCount}</span> : null}
    </div>
  );
}

Launcher.propTypes = propTypes;

export default Launcher;
