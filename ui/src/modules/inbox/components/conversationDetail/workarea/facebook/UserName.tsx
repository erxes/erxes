import * as React from 'react';

type Props = {
  username?: string;
  userId?: string;
};

class UserName extends React.Component<Props, {}> {
  render() {
    const { username, userId } = this.props;

    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://facebook.com/${username}-${userId}`}
      >
        {username}
      </a>
    );
  }
}

export default UserName;
