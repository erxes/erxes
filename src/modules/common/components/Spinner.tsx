import { rotate } from 'modules/common/utils/animations';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';

const size = 26;

const Spin = styledTS<{ objective: boolean }>(styled.div)`
  height: ${props => props.objective && '100px'};
  position: ${props => props.objective && 'relative'};
`;

export const MainLoader = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${size}px;
  height: ${size}px;
  margin-left: -${size / 2}px;
  margin-top: -${size / 2}px;
  animation: ${rotate} 0.75s linear infinite;
  border: 2px solid ${colors.borderDarker};
  border-top-color: ${colors.colorSecondary};
  border-right-color: ${colors.colorSecondary};
  border-radius: 100%;
`;

type Props = {
  objective?: boolean;
};

function Spinner({ objective = false }: Props) {
  return (
    <Spin objective={objective}>
      <MainLoader />
    </Spin>
  );
}

export default Spinner;
