import React from 'react';
import { ContenFooter, ContentBox, MainContent } from '../styles';

type Props = {
  flowJobBar?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  transparent: boolean;
  center?: boolean;
  noPadding?: boolean;
  initialOverflow?: boolean;
};

function PageContent({
  flowJobBar,
  footer,
  children,
  transparent,
  center,
  noPadding,
  initialOverflow
}: Props) {
  return (
    <MainContent
      transparent={transparent}
      center={center}
      noPadding={noPadding}
    >
      {flowJobBar}
      <ContentBox transparent={transparent} initialOverflow={initialOverflow}>
        {children}
      </ContentBox>
      {footer && <ContenFooter>{footer}</ContenFooter>}
    </MainContent>
  );
}

export default PageContent;
