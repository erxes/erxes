import React from 'react';
import PropTypes from 'prop-types';
import { Label } from './styles';

const propTypes = {
  children: PropTypes.node.isRequired
};

function ControlLabel(props) {
  return <Label>{props.children}</Label>;
}

ControlLabel.propTypes = propTypes;

export default ControlLabel;
