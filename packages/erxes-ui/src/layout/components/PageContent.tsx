import React from 'react';
import { ContenFooter, ContentBox, MainContent } from '../styles';

type Props = {
  actionBar?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  transparent: boolean;
  center?: boolean;
  hasBorder?: boolean;
};

function PageContent({
  actionBar,
  footer,
  children,
  transparent,
  center,
  hasBorder
}: Props) {
  return (
    <MainContent transparent={transparent} center={center} hasBorder={hasBorder}>
      {actionBar}
      <ContentBox transparent={transparent}>{children}</ContentBox>
      {footer && <ContenFooter>{footer}</ContenFooter>}
    </MainContent>
  );
}

export default PageContent;
