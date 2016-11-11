import React, { PropTypes } from 'react';


const propTypes = {
  user: PropTypes.object.isRequired,
};

function User({ user }) {
  const detail = user.details || {};

  const avatar = detail.avatar || 'https://lh3.googleusercontent.com/-2rtYO7Xu22Q/AAAAAAAAAAI/AAAAAAAAAAA/j9myw0A-3r4/photo.jpg';
  return (
    <div className="avatar">
      <img src={avatar} alt="Avatar" />
    </div>
  );
}

User.propTypes = propTypes;

export default User;
