import React from 'react';
import PropTypes from 'prop-types';
import { Label } from './styles';

const propTypes = {
  children: PropTypes.node.isRequired
};

class ControlLabel extends React.Component {
  render() {
    const { children } = this.props;

    return <Label>{children}</Label>;
  }
}

ControlLabel.propTypes = propTypes;

export default ControlLabel;
