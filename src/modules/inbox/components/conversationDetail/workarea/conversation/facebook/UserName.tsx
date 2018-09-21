import React, { Component } from "react";

type Props = {
  username?: string;
  userId?: string;
};

class UserName extends Component<Props, {}> {
  render() {
    const { username, userId } = this.props;

    return (
      <a target="_blank" href={`https://facebook.com/${username}-${userId}`}>
        {username}
      </a>
    );
  }
}

export default UserName;
