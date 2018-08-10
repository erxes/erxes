import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Reaction } from './styles';

const propTypes = {
  reactions: PropTypes.object.isRequired
};

class Reactions extends Component {
  render() {
    const { reactions } = this.props;

    return Object.keys(reactions).map(value => {
      const users = reactions[value].map((value, index) => (
        <div key={index}>{value.name}</div>
      ));

      const tooltip = <Tooltip id="tooltip">{users}</Tooltip>;

      if (!reactions[value].length > 0) {
        return null;
      }

      return (
        <OverlayTrigger key={value} placement="top" overlay={tooltip}>
          <Reaction className={value} />
        </OverlayTrigger>
      );
    });
  }
}

Reactions.propTypes = propTypes;

export default Reactions;
