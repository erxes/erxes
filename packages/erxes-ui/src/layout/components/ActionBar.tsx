import React from 'react';
import { ContentHeader, HeaderContent, HeaderItems } from '../styles';

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  background?: string;
  zIndex?: number;
  rightWidth?: string;
  leftWidth?: string;
};

function ActionBar({ left, right, background, bottom, zIndex, rightWidth, leftWidth }: Props) {
  return (
    <ContentHeader background={background || 'bgLight'} zIndex={zIndex}>
      <HeaderContent>
        {left && <HeaderItems width={rightWidth}>{left}</HeaderItems>}
        {right && <HeaderItems rightAligned={true} width={leftWidth}>{right}</HeaderItems>}
      </HeaderContent>
      {bottom}
    </ContentHeader>
  );
}

export default ActionBar;
