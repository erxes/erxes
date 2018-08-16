import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Reaction, LeftAlign } from './styles';

const propTypes = {
  reactions: PropTypes.object.isRequired,
  comment: PropTypes.bool
};

class Reactions extends Component {
  renderUsers(users) {
    return users.map((user, index) => (
      <LeftAlign key={index}>{user.name}</LeftAlign>
    ));
  }

  renderReaction(key, users) {
    const tooltip = (
      <Tooltip id="tooltip">
        <LeftAlign>
          <b>{key}</b>
        </LeftAlign>
        {this.renderUsers(users)}
      </Tooltip>
    );

    if (!users.length > 0) {
      return null;
    }

    return (
      <OverlayTrigger key={key} placement="top" overlay={tooltip}>
        <Reaction className={key} comment={this.props.comment} />
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
