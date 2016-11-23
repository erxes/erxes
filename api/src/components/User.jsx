import React, { PropTypes } from 'react';


const propTypes = {
  // TODO: user must be required
  user: PropTypes.object,
};

function User({ user }) {
  const avatar = user && user.details && user.details.avatar;
  const defaultAvatar = 'https://www.erxes.org/assets/images/userDefaultIcon.png';

  return (
    <div className="avatar">
      <img src={avatar || defaultAvatar} alt="avatar" />
    </div>
  );
}

User.propTypes = propTypes;

export default User;
