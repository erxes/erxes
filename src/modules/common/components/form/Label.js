import React from 'react';
import PropTypes from 'prop-types';
import { Label } from './styles';

const propTypes = {
  children: PropTypes.node.isRequired
};

function ControlLabel(props, { __ }) {
  return <Label>{__(props.children)}</Label>;
}

ControlLabel.propTypes = propTypes;
ControlLabel.contextTypes = {
  __: PropTypes.func
};

export default ControlLabel;
