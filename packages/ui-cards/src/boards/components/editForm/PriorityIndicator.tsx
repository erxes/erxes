import { ItemIndicator } from '../../styles/stage';
import React from 'react';
import { colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Indicator = styled(ItemIndicator)`
  margin: 0 5px 0 0;
`;

const FullBackgrounded = styledTS<{ color: string }>(styled.span)`
  background-color: ${props => props.color};
  margin-left: 5px;
  padding: 5px 10px;
  border-radius: 300px;
  color: ${colors.colorWhite};
  font-weight: 450;
  font-size: 12px;
`;

type IProps = {
  value: string;
  isFullBackground?: boolean;
};

export default (props: IProps) => {
  const findColor = () => {
    switch (props.value) {
      case 'Critical':
      case 'Awareness':
        return colors.colorCoreRed;
      case 'High':
      case 'Acquisition':
        return colors.colorCoreYellow;
      case 'Medium':
      case 'Activation':
        return colors.colorCoreBlue;
      case 'Revenue':
        return colors.colorCoreTeal;
      case 'Retention':
        return colors.colorCoreGreen;

      default:
        return colors.colorCoreLightGray;
    }
  };

  if (props.isFullBackground) {
    return (
      <FullBackgrounded color={findColor()}>{props.value}</FullBackgrounded>
    );
  }

  return <Indicator color={findColor()} />;
};
