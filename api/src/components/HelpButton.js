import React, { PropTypes } from 'react';


const propTypes = {
  onLauncherClick: PropTypes.func.isRequired,
  customer: PropTypes.object.isRequired,
};

function HelpButton({ onLauncherClick, customer }) {
  const unreadCommentCount = customer.unreadCommentCount || '';

  return (
    <div className="launcher" onClick={onLauncherClick}>
      {unreadCommentCount ? <span>{unreadCommentCount}</span> : null}
    </div>
  );
}

HelpButton.propTypes = propTypes;

export default HelpButton;
