import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tip } from 'modules/common/components';
import { colors } from 'modules/common/styles';

const propTypes = {
  users: PropTypes.array
};

const defaultProps = {
  users: []
};

const UserCounterContainer = styled.ul`
  margin-bottom: 0;
  list-style: none;
  padding: 0;
  flex-shrink: 0;
  align-self: flex-end;

  li {
    float: left;
    border: 2px solid ${colors.colorWhite};
    width: 28px;
    height: 28px;
    line-height: 26px;
    border-radius: 14px;
    background: ${colors.colorCoreLightGray};
    text-align: center;
    color: ${colors.colorWhite};
    overflow: hidden;
    margin-left: -12px;
    font-size: 10px;

    img {
      width: 100%;
      vertical-align: top;
    }
  }
`;

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
UserCounter.defaultProps = defaultProps;

export default UserCounter;
