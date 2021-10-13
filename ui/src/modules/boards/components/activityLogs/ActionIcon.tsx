import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const RoundedBackground = styledTS<{ icon: string }>(styled.span)`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  text-align: center;
  display: flex;
  justify-content: center;
  background: ${props =>
    (props.icon === 'move' && '#3B85F4') ||
    (props.icon === 'file-minus' && '#F44236') ||
    (props.icon === 'notes' && '#8c7ae6') ||
    (props.icon === 'file-check' && '#34c1c6') ||
    (props.icon === 'archive-alt' && '#fdb761') ||
    '#8c7ae6'};

  i {
    color: ${colors.colorWhite};
    font-size: 10px;
    line-height: 18px;
  }
`;

type Props = {
  queryParams: any;
};

class ActionIcon extends React.PureComponent<Props> {
  getIcon() {
    const { queryParams } = this.props;
    let icon = 'user-check';

    if (queryParams.includes('moved')) {
      icon = 'move';
    }

    if (queryParams.includes('delete')) {
      icon = 'file-minus';
    }

    if (queryParams.includes('addNote')) {
      icon = 'notes';
    }

    if (queryParams.includes('create')) {
      icon = 'file-check';
    }

    if (queryParams.includes('archive')) {
      icon = 'archive-alt';
    }

    return icon;
  }

  render() {
    return (
      <RoundedBackground icon={this.getIcon()}>
        <Icon icon={this.getIcon()} />
      </RoundedBackground>
    );
  }
}

export default ActionIcon;
