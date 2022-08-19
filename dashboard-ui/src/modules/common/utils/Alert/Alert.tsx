import Icon from 'modules/common/components/Icon';
import { colors, dimensions, typography } from 'modules/common/styles';
import { darken } from 'modules/common/styles/color';
import { slideDown } from 'modules/common/utils/animations';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const types = {
  info: {
    background: colors.colorCoreBlue,
    icon: 'info-circle'
  },

  warning: {
    background: darken(colors.colorCoreYellow, 10),
    icon: 'exclamation-triangle'
  },

  error: {
    background: colors.colorCoreRed,
    icon: 'times-circle'
  },

  success: {
    background: colors.colorCoreGreen,
    icon: 'check-circle'
  }
};

export const AlertItem = styledTS<{ type: string }>(styled.div)`
  display: table;
  margin: 29px auto;
  transition: all 0.5s;
  color: ${colors.colorWhite};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  z-index: 10;
  font-weight: ${typography.fontWeightLight};
  background-color: ${props => types[props.type].background};
  animation-name: ${slideDown};
  border-radius: 2px;
  animation-duration: 0.3s;
  animation-timing-function: ease;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);

  span {
    margin-left: ${dimensions.unitSpacing}px;
  }

  i {
    margin: 0;
    font-size: 15px;
  }
`;

type Props = {
  type: string;
  children: React.ReactNode;
};

type State = {
  visible: boolean;
};

export default class AlertStyled extends React.Component<Props, State> {
  static defaultProps = {
    type: 'information'
  };

  private timeout?: NodeJS.Timer = undefined;

  constructor(props: Props) {
    super(props);

    this.state = { visible: true };
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
    if (!this.state.visible) {
      return null;
    }

    return (
      <AlertItem {...this.props}>
        <Icon icon={types[this.props.type].icon} />
        &nbsp;
        {this.props.children}
      </AlertItem>
    );
  }
}
