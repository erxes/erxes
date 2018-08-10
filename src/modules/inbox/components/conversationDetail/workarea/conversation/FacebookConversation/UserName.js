import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  username: PropTypes.string,
  userId: PropTypes.string
};

class UserName extends Component {
  render() {
    const { username, userId } = this.props;

    return (
      <a target="_blank" href={`https://facebook.com/${username}-${userId}`}>
        {username}
      </a>
    );
  }
}

UserName.propTypes = propTypes;

export default UserName;
