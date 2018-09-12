import * as React from 'react';
import { ContenFooter, ContentBox, MainContent } from '../styles';

type Props = {
  actionBar?: React.ReactNode,
  footer?: React.ReactNode,
  children?: React.ReactNode,
  transparent: boolean
};

function PageContent({ actionBar, footer, children, transparent }: Props) {
  return (
    <MainContent transparent={transparent}>
      {actionBar}
      <ContentBox transparent={transparent}>{children}</ContentBox>
      {footer && <ContenFooter>{footer}</ContenFooter>}
    </MainContent>
  );
}

export default PageContent;
