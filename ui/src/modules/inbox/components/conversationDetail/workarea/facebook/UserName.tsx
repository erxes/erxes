import * as React from 'react';

type Props = {
  username?: string;
  userId?: string;
};

class UserName extends React.Component<Props, {}> {
  render() {
    const { username } = this.props;

    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.facebook.com/search/top/?q=${username}`}
      >
        {username}
      </a>
    );
  }
}

export default UserName;
