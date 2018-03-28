import React from 'react';
import PropTypes from 'prop-types';
import { UserCounterContainer } from '../../styles';
import { Tip } from 'modules/common/components';

const propTypes = {
  users: PropTypes.array
};

class UserCounter extends React.Component {
  constructor(props) {
    super(props);

    this.state = { show: false };
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
      <li onClick={this.showOthers.bind(this)} className="remained-count">
        +{users.length - 1}
      </li>
    );
  }

  render() {
    const { users } = this.props;
    const length = users.length;

    if (length === 0) return null;

    return (
      <UserCounterContainer>
        {this.renderUserItem(users[0])}
        {length > 1 ? this.renderOtherUsers(users) : null}
      </UserCounterContainer>
    );
  }
}

UserCounter.propTypes = propTypes;

export default UserCounter;
