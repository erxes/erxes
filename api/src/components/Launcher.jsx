import React, { PropTypes } from 'react';


const propTypes = {
  onLauncherClick: PropTypes.func.isRequired,
  notifsCount: PropTypes.number.isRequired,
};

function Launcher({ onLauncherClick, notifsCount }) {
  return (
    <div className="erxes-launcher" onClick={onLauncherClick}>
      {notifsCount ? <span>{notifsCount}</span> : null}
    </div>
  );
}

Launcher.propTypes = propTypes;

export default Launcher;
