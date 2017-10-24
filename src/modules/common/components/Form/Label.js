import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors, typography } from '../../styles';

const Label = styled.label`
  text-transform: uppercase;
  display: inline-block;
  color: ${colors.colorCoreGray};
  font-size: ${typography.fontSizeUppercase}px;
  margin-bottom: 5px;
`;

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
