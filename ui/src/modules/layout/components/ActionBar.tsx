import React from 'react';
import { ContentHeader, HeaderContent, HeaderItems } from '../styles';

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  background?: string;
  zIndex?: number;
};

function ActionBar({ left, right, background, bottom, zIndex }: Props) {
  return (
    <ContentHeader background={background || 'bgLight'} zIndex={zIndex}>
      <HeaderContent>
        {left && <HeaderItems>{left}</HeaderItems>}
        {right && <HeaderItems rightAligned={true}>{right}</HeaderItems>}
      </HeaderContent>
      {bottom}
    </ContentHeader>
  );
}

export default ActionBar;
