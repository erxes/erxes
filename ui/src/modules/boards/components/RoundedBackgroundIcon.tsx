import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const iconWithColor = {
  move: '3B85F4',
  'file-minus': 'F44236',
  notes: '8c7ae6',
  'file-check': '34c1c6',
  'archive-alt': 'fdb761'
};

const RoundedBackground = styledTS<{ icon: string }>(styled.span)`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  text-align: center;
  display: flex;
  justify-content: center;
  background: ${props => `#${iconWithColor[props.icon]}`};

  i {
    color: ${colors.colorWhite};
    font-size: 10px;
    line-height: 18px;
  }
`;

type Props = {
  icon: string;
};

class RoundedBackgroundIcon extends React.PureComponent<Props> {
  render() {
    const { icon } = this.props;

    return (
      <RoundedBackground icon={icon}>
        <Icon icon={icon} />
      </RoundedBackground>
    );
  }
}

export default RoundedBackgroundIcon;
