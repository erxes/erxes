import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Reaction } from './styles';

const propTypes = {
  reactions: PropTypes.object.isRequired
};

class Reactions extends Component {
  renderUsers(users) {
    return users.map((user, index) => <div key={index}>{user.name}</div>);
  }

  renderReaction(key, users) {
    const tooltip = <Tooltip id="tooltip">{this.renderUsers(users)}</Tooltip>;

    if (!users.length > 0) {
      return null;
    }

    return (
      <OverlayTrigger key={key} placement="top" overlay={tooltip}>
        <Reaction className={key} />
      </OverlayTrigger>
    );
  }

  render() {
    const { reactions } = this.props;

    return Object.keys(reactions).map(key =>
      this.renderReaction(key, reactions[key])
    );
  }
}

Reactions.propTypes = propTypes;

export default Reactions;
