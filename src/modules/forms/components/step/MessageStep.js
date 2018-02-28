import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  brands: PropTypes.array,
  changeState: PropTypes.func,
  users: PropTypes.array,
  method: PropTypes.string,
  templates: PropTypes.array,
  defaultValue: PropTypes.object
};

class MessageStep extends Component {
  render() {
    const { method } = this.props;

    if (method === 'email') {
      return <div>email</div>;
    }

    return <div>messenger</div>;
  }
}

MessageStep.propTypes = propTypes;

export default MessageStep;
