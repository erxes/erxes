import { ContentHeader, HeaderContent, HeaderItems } from '../styles';

import React from 'react';

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  background?: string;
  zIndex?: number;
  hasFlex?: boolean;
  noBorder?: boolean;
  wideSpacing?: boolean;
};

class ActionBar extends React.PureComponent<Props> {
  render() {
    const {
      left,
      right,
      background,
      bottom,
      zIndex,
      hasFlex,
      wideSpacing
    } = this.props;

    return (
      <ContentHeader
        background={background || 'colorWhite'}
        zIndex={zIndex}
        wideSpacing={wideSpacing}
      >
        <HeaderContent>
          {left && <HeaderItems hasFlex={hasFlex}>{left}</HeaderItems>}
          {right && <HeaderItems rightAligned={true}>{right}</HeaderItems>}
        </HeaderContent>
        {bottom}
      </ContentHeader>
    );
  }
}

export default ActionBar;
