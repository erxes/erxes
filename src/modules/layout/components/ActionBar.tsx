import * as React from 'react';
import { ContentHeader, HeaderItems } from '../styles';

type Props = {
  left?: React.ReactNode,
  right?: React.ReactNode,
  background?: React.ReactNode
}

function ActionBar({ left, right, background }: Props) {
  return (
    <ContentHeader background={background || 'bgLight'}>
      {left && <HeaderItems>{left}</HeaderItems>}
      {right && <HeaderItems rightAligned>{right}</HeaderItems>}
    </ContentHeader>
  );
}

export default ActionBar;
