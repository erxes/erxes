import Icon from 'modules/common/components/Icon';
import { colors, dimensions, typography } from 'modules/common/styles';
import { slideDown } from 'modules/common/utils/animations';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const types = {
  info: {
    background: colors.colorCoreBlue,
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

const AlertItem = styledTS<{ type: string }>(styled.div)`
  display: table;
  margin: 29px auto;
  transition: all 0.5s;
  color: ${colors.colorWhite};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  z-index: 10;
  font-weight: ${typography.fontWeightLight};
  background-color: ${props => types[props.type].background};
  animation-name: ${slideDown};
  animation-duration: 0.3s;
  animation-timing-function: ease;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);

  span {
    margin-left: ${dimensions.unitSpacing}px;
  }

  i {
    margin: 0;
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
