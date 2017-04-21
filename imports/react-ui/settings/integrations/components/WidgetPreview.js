import React from 'react';
import PropTypes from 'prop-types';

function WidgetPreview({ color, wallpaper, user }) {
  const avatar = (user.details && user.details.avatar) || '/images/userDefaultIcon.png';
  const fullName = (user.details && user.details.fullName) || 'Support staff';
  const backgroundClasses = `erxes-messages-list background-${wallpaper}`;
  return (
    <div className="widget-preview">
      <div className="erxes-topbar" style={{ backgroundColor: color }}>
        <div className="topbar-button" />
        <div className="erxes-middle">
          <div className="erxes-staff-profile">
            <img src={avatar} alt={fullName} />
            <div className="erxes-staff-name">{fullName}</div>
            <div className="erxes-state">
              <span className="online" />
              Online
            </div>
          </div>
        </div>
      </div>
      <ul className={backgroundClasses}>
        <li className="erxes-spacial-message">
          We welcome you warmly to erxes and look forward to a long term
          healthy working association with us.
        </li>
        <li>
          <div className="erxes-avatar">
            <img src={avatar} alt="avatar" />
          </div>
          <div className="erxes-message">
            Hi, any questions?
          </div>
          <div className="date">1 hour ago</div>
        </li>
        <li className="from-customer">
          <div className="erxes-message from-customer" style={{ backgroundColor: color }}>
            We need your help!
          </div>
          <div className="date">6 minutes ago</div>
        </li>
      </ul>
      <div className="erxes-message-sender">
        <span>Write a reply ...</span>
      </div>
    </div>
  );
}

WidgetPreview.propTypes = {
  color: PropTypes.string.isRequired,
  wallpaper: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line
};

export default WidgetPreview;
