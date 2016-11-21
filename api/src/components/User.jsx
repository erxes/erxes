import React, { PropTypes } from 'react';


const propTypes = {
  user: PropTypes.object.isRequired,
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
