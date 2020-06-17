import { colors } from 'modules/common/styles';
import { highlight } from 'modules/common/utils/animations';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

type Props = {
  width?: string;
};

const Spin = styledTS<Props>(styled.div)`
  position: absolute;
  overflow: auto;
  height: 100%;
  width: ${props => props.width};
  z-index: 99999;
  display: ${'flex'};
`;

export const MainLoader = styledTS<Props>(styled.div)`
  width: 100%;
  height: 100%;
  animation: ${highlight} 0.75s linear infinite;
  border-top: 2px solid ${colors.borderDarker};
  border-top-color: ${colors.colorSecondary};
`;

function DragDisabler({ width = '100%' }: Props) {
  return (
    <Spin width={width}>
      <MainLoader width={width} />
    </Spin>
  );
}

export default DragDisabler;
