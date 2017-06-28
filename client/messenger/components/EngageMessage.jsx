import React, { PropTypes } from 'react';
import striptags from 'striptags';
import { User } from '../components';

const propTypes = {
  engageData: PropTypes.object,
};

function EngageMessage({ engageData }) {
  const user = engageData.fromUser;
  const bodyClass = `notification-body ${engageData.sentAs}`;

  return (
    <div className="notification-wrapper">
      <div className="user-info">
        <User user={user} />
        {user.details.fullName}
      </div>
      <div className={bodyClass}>
        {striptags(engageData.content)}
      </div>
    </div>
  );
}

EngageMessage.propTypes = propTypes;

export default EngageMessage;
