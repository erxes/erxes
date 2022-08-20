import Icon from '../../components/Icon';
import { colors, dimensions, typography } from '../../styles';
import { darken } from '../../styles/ecolor';
import { slideDown } from '../../utils/animations';
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
  position:relative;
  display: flex;
  justify-content: space-between;
  align-items:center;
  transition: all 0.5s;
  color: ${colors.textPrimary};
  margin: ${dimensions.unitSpacing}px auto;
  padding: ${dimensions.unitSpacing}px;
  z-index: ${dimensions.unitSpacing};
  font-weight: ${typography.fontWeightRegular};
  background-color: ${colors.colorWhite};
  animation-name: ${slideDown};
  border-radius: 4px;
  border-left: ${dimensions.unitSpacing - 4}px solid ${props =>
  types[props.type].background};
  animation-duration: 0.3s;
  animation-timing-function: ease;
  box-shadow: -1px 0 5px rgba(0, 0, 0, 0.3);
  
  > div {
    display: flex;
    align-items: center;
    margin-right: ${dimensions.unitSpacing}px;
  }

  span {
    margin-left: ${dimensions.unitSpacing}px;
  }

  i {
    margin-right: 5px;
    font-size: 25px;
    color: ${props => types[props.type].background};
  }

  button {
    background:none;
    border: none;
    cursor: pointer;
    padding: 0;

    > i {
      font-size: ${dimensions.unitSpacing + 2}px;
      color: ${colors.colorCoreGray};
    }
  }
`;

type Props = {
  type: string;
  index: number;
  deleteNode: (index: number) => void;
  children: React.ReactNode;
};

export default class AlertStyled extends React.Component<Props> {
  static defaultProps = {
    type: 'information'
  };

  handleClose = () => {
    const { deleteNode, index } = this.props;

    deleteNode(index);
  };

  render() {
    return (
      <AlertItem {...this.props}>
        <div>
          <Icon icon={types[this.props.type].icon} />
          {this.props.children}
        </div>
        <button type="button" onClick={this.handleClose}>
          <Icon icon="times" />
        </button>
      </AlertItem>
    );
  }
}
