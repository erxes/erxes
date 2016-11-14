import React, { PropTypes } from 'react';


const propTypes = {
  onLauncherClick: PropTypes.func.isRequired,
  notifsCount: PropTypes.number.isRequired,
};

function HelpButton({ onLauncherClick, notifsCount }) {
  return (
    <div className="launcher" onClick={onLauncherClick}>
      { notifsCount ? <span>{notifsCount}</span> : null}
    </div>
  );
}

HelpButton.propTypes = propTypes;

export default HelpButton;
