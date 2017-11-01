import React from 'react';
import PropTypes from 'prop-types';
import { MainContent, ContentBox, ContenFooter } from '../styles';

const propTypes = {
  actionBar: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node
};

function PageContent({ actionBar, footer, children }) {
  return (
    <MainContent>
      {actionBar}
      <ContentBox>{children}</ContentBox>
      {footer && <ContenFooter>{footer}</ContenFooter>}
    </MainContent>
  );
}

PageContent.propTypes = propTypes;

export default PageContent;
