import { ItemIndicator } from 'modules/boards/styles/stage';
import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';

const Indicator = styled(ItemIndicator)`
  margin-right: 0 5px 0 0;
`;

type IProps = {
  value: string;
};

export default (props: IProps) => {
  const findColor = () => {
    switch (props.value) {
      case 'Critical':
        return colors.colorCoreRed;
      case 'High':
        return colors.colorCoreYellow;
      case 'Normal':
        return colors.colorCoreBlue;

      default:
        return colors.colorCoreLightGray;
    }
  };

  return <Indicator color={findColor()} />;
};
