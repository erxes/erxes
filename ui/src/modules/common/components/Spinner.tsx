import { rotate } from 'modules/common/utils/animations';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';

type Props = {
  objective?: boolean;
  size?: number;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
};

const Spin = styledTS<Props>(styled.div)`
  height: ${props => props.objective && '100px'};
  position: ${props => props.objective && 'relative'};
`;

export const MainLoader = styledTS<Props>(styled.div)`
  position: absolute;
  left: ${props => props.left};
  right: ${props => props.right};
  top: ${props => props.top};
  bottom: ${props => props.bottom};
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin-left: -${props => props.size}px;
  margin-top: -${props => props.size && props.size / 2}px;
  animation: ${rotate} 0.75s linear infinite;
  border: 2px solid ${colors.borderDarker};
  border-top-color: ${colors.colorSecondary};
  border-right-color: ${colors.colorSecondary};
  border-radius: 100%;
`;

function Spinner({
  objective = false,
  size = 26,
  top = '50%',
  bottom = 'auto',
  left = '50%',
  right = 'auto'
}: Props) {
  return (
    <Spin objective={objective}>
      <MainLoader
        size={size}
        top={top}
        bottom={bottom}
        right={right}
        left={left}
      />
    </Spin>
  );
}

export default Spinner;
