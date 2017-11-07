import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import Icon from '../../components/Icon';
import { colors, typography } from '../../styles';

const types = {
  info: {
    background: colors.colorSecondary,
    icon: 'information-circled'
  },

  warning: {
    background: colors.colorCoreYellow,
    icon: 'alert-circled'
  },

  error: {
    background: colors.colorCoreRed,
    icon: 'close-circled'
  },

  success: {
    background: colors.colorCoreGreen,
    icon: 'checkmark-circled'
  }
};

const slidedown = keyframes`
  0% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(8%);
  }
  65% {
    transform: translateY(-4%);
  }
  80% {
    transform: translateY(4%);
  }
  95% {
    transform: translateY(-2%);
  }
  100% {
    transform: translateY(0%);
  }
`;

const Alertstyled = styled.div`
  display: table;
  margin: 0 auto;
  margin-top: 10px;
  border-radius: 2px;
  transition: top 2s;
  padding: 8px 48px 8px 38px;
  z-index: 1;
  font-weight: ${typography.fontWeightMedium};
  background-color: ${props => types[props.type].background};
  font-weight: bold;
  position: relative;
  text-align: left;
  animation-name: ${slidedown};
  animation-duration: 1s;
  animation-timing-function: ease;

  span {
    margin-left: 5px;
    color: #fff;
    line-height: 1.5;
  }

  i {
    color: white;
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
      <Alertstyled {...this.props}>
        <Icon icon={types[this.props.type].icon} />
        <span>{this.props.text}</span>
      </Alertstyled>
    ) : null;
  }
}

AlertStyled.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

AlertStyled.defaultProps = {
  type: 'info'
};
