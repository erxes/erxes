import React from 'react';
import PropTypes from 'prop-types';
import { Label } from './styles';

const propTypes = {
  children: PropTypes.node.isRequired,
  ignoreTrans: PropTypes.bool
};

function ControlLabel(props, { __ }) {
  const { children, ignoreTrans } = props;

  return <Label>{ignoreTrans ? children : __(children)}</Label>;
}

ControlLabel.propTypes = propTypes;
ControlLabel.contextTypes = {
  __: PropTypes.func
};

export default ControlLabel;
