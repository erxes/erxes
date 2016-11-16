import React, { PropTypes } from 'react';


const propTypes = {
  user: PropTypes.object.isRequired,
};

function User({ user }) {
  const detail = user.details || {};

  const avatar = detail.avatar || 'https://www.erxes.org/assets/images/userDefaultIcon.png';
  return (
    <div className="avatar">
      <img src={avatar} alt="Avatar" />
    </div>
  );
}

User.propTypes = propTypes;

export default User;
