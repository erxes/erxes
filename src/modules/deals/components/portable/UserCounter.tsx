import { IUser } from 'modules/auth/types';
import { Tip } from 'modules/common/components';
import { UserCounterContainer } from 'modules/deals/styles/deal';
import * as React from 'react';

type Props = {
  users: IUser[];
};

class UserCounter extends React.Component<Props, { show: boolean }> {
  constructor(props) {
    super(props);

    this.state = { show: false };
    this.showOthers = this.showOthers.bind(this);
  }

  showOthers() {
    this.setState({ show: true });
  }

  renderUserItem(item) {
    return (
      <li key={item._id}>
        <Tip text={item.details.fullName || item.email}>
          <img
            alt={item.details.fullName || item.email}
            src={item.details.avatar || '/images/avatar-colored.svg'}
          />
        </Tip>
      </li>
    );
  }

  renderOtherUsers(users) {
    if (this.state.show) {
      return users.map(
        (user, index) => (index > 0 ? this.renderUserItem(user) : null)
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
