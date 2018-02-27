import React from 'react';
import PropTypes from 'prop-types';
import { DealUsers } from '../../styles';
import { Tip } from 'modules/common/components';

const propTypes = {
  users: PropTypes.array
};

class DealUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  showOthers() {
    this.setState({
      show: true
    });
  }

  render() {
    const users = this.props.users;
    const length = users.length;

    if (length === 0) {
      return null;
    }

    const userItem = el => {
      return (
        <li key={el._id}>
          <Tip text={el.details.fullName || el.email}>
            <img
              alt={el.details.fullName || el.email}
              src={el.details.avatar || '/images/avatar-colored.svg'}
            />
          </Tip>
        </li>
      );
    };

    const otherUsers = () => {
      if (this.state.show) {
        return users.map((el, index) => (index > 0 ? userItem(el) : null));
      } else {
        return (
          <li onClick={this.showOthers.bind(this)} className="remained-count">
            +{length - 1}
          </li>
        );
      }
    };

    return (
      <DealUsers>
        {userItem(users[0])}
        {length > 1 ? otherUsers() : null}
      </DealUsers>
    );
  }
}

DealUser.propTypes = propTypes;

export default DealUser;
