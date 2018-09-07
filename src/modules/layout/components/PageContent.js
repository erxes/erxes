import * as React from 'react';
import PropTypes from 'prop-types';
import { MainContent, ContentBox, ContenFooter } from '../styles';

const propTypes = {
  actionBar: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
  transparent: PropTypes.bool
};

function PageContent({ actionBar, footer, children, transparent }) {
  return (
    <MainContent transparent={transparent}>
      {actionBar}
      <ContentBox transparent={transparent}>{children}</ContentBox>
      {footer && <ContenFooter>{footer}</ContenFooter>}
    </MainContent>
  );
}

PageContent.propTypes = propTypes;

export default PageContent;
