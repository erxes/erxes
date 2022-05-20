import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

import { FlexCenter } from '../../../common/styles/main';

const Pad = styledTS<{ isPortrait?: boolean; mainVar: number }>(
  styled(FlexCenter)
)`
  width: ${props => props.mainVar}px;
  height: ${props => props.mainVar}px;
  border-radius: ${props => props.mainVar}px;
  line-height: ${props => props.mainVar}px;
  background: #eee;
  margin: 8px;
  font-size: ${props => props.mainVar * 0.5}px;
  font-weight: 600;
  cursor: pointer;
`;

type Props = {
  num: string;
  isPortrait: boolean | undefined;
  onClick: (val: string) => void;
};

export default function KeyPad({ num, onClick, isPortrait }: Props) {
  const mainVar = Math.min(window.innerHeight, window.innerWidth) * 0.1;

  return (
    <Pad
      onClick={() => onClick(num.toString())}
      isPortrait={isPortrait}
      mainVar={mainVar}
    >
      {num}
    </Pad>
  );
}
