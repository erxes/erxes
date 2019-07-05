import { IUser } from 'modules/auth/types';
import { UserCounterContainer } from 'modules/boards/styles/item';
import Tip from 'modules/common/components/Tip';
import { getUserAvatar } from 'modules/common/utils';
import React from 'react';

type Props = {
  users: IUser[];
};

class UserCounter extends React.Component<Props, { show: boolean }> {
  constructor(props) {
    super(props);

    this.state = { show: false };
  }

  showOthers = () => {
    this.setState({ show: true });
  };

  renderUserItem(item) {
    return (
      <li key={item._id}>
        <Tip text={item.details.fullName || item.email}>
          <img
            alt={item.details.fullName || item.email}
            src={getUserAvatar(item)}
          />
        </Tip>
      </li>
    );
  }

  renderOtherUsers(users) {
    if (this.state.show) {
      return users.map((user, index) =>
        index > 0 ? this.renderUserItem(user) : null
      );
    }

    return (
      <li onClick={this.showOthers} className="remained-count">
        +{users.length - 1}
      </li>
    );
  }

  render() {
    const { users } = this.props;
    const length = users.length;

    if (length === 0) {
      return null;
    }

    return (
      <UserCounterContainer>
        {this.renderUserItem(users[0])}
        {length > 1 ? this.renderOtherUsers(users) : null}
      </UserCounterContainer>
    );
  }
}

export default UserCounter;
