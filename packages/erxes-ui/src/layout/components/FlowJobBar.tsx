import React from 'react';
import { ContentHeader, HeaderContent, HeaderItems } from '../styles';

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  background?: string;
  zIndex?: number;
  hasFlex?: boolean;
  withMargin?: boolean;
  wide?: boolean;
  noBorder?: boolean;
};

function FlowJobBar({
  left,
  right,
  background,
  bottom,
  zIndex,
  hasFlex,
  withMargin,
  wide,
  noBorder
}: Props) {
  return (
    <ContentHeader
      background={background || 'bgLight'}
      noBorder={noBorder}
      zIndex={zIndex}
      withMargin={withMargin}
      wide={wide}
    >
      <HeaderContent>
        {left && <HeaderItems hasFlex={hasFlex}>{left}</HeaderItems>}
        {right && <HeaderItems rightAligned={true}>{right}</HeaderItems>}
      </HeaderContent>
      {bottom}
    </ContentHeader>
  );
}

export default FlowJobBar;
