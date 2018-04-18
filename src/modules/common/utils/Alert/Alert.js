import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import Icon from 'modules/common/components/Icon';
import { colors, typography, dimensions } from 'modules/common/styles';

const types = {
  information: {
    background: colors.colorSecondary,
    icon: 'information'
  },

  warning: {
    background: colors.colorCoreYellow,
    icon: 'clock'
  },

  error: {
    background: colors.colorCoreRed,
    icon: 'cancel-1'
  },

  success: {
    background: colors.colorCoreGreen,
    icon: 'checked-1'
  }
};

const slidedown = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0%);
    opacity: 1;
  }
`;

const AlertItem = styled.div`
  display: table;
  margin: 29px auto;
  transition: all 0.5s;
  color: ${colors.colorWhite};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  z-index: 10;
  font-weight: ${typography.fontWeightLight};
  background-color: ${props => types[props.type].background};
  animation-name: ${slidedown};
  animation-duration: 0.5s;
  animation-timing-function: ease;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);

  span {
    margin-left: ${dimensions.unitSpacing}px;
  }

  i {
    margin: 0;
  }
`;

export default class AlertStyled extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({ visible: false });
    }, 3000);
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    return this.state.visible ? (
      <AlertItem {...this.props}>
        <Icon icon={types[this.props.type].icon} />
        <span>{this.props.text}</span>
      </AlertItem>
    ) : null;
  }
}

AlertStyled.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

AlertStyled.defaultProps = {
  type: 'information'
};
