import React from 'react';
import { ContenFooter, ContentBox, MainContent } from '../styles';

type Props = {
  actionBar?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  transparent: boolean;
  center?: boolean;
  noPadding?: boolean;
};

function PageContent({
  actionBar,
  footer,
  children,
  transparent,
  center,
  noPadding,
}: Props) {
  return (
    <MainContent transparent={transparent} center={center} noPadding={noPadding}>
      {actionBar}
      <ContentBox transparent={transparent}>{children}</ContentBox>
      {footer && <ContenFooter>{footer}</ContenFooter>}
    </MainContent>
  );
}

export default PageContent;
