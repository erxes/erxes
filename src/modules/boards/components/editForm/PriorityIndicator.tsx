import { ItemIndicator } from 'modules/boards/styles/stage';
import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';

const Indicator = styled(ItemIndicator)`
  margin: 0 5px 0 0;
`;

type IProps = {
  value: string;
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
      case 'Normal':
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

  return <Indicator color={findColor()} />;
};
