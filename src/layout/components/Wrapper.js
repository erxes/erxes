import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Sidebar from './Sidebar';
import PageContent from './PageContent';
import ActionBar from './ActionBar';
import { MainWrapper, Contents } from '../styles';

const propTypes = {
  header: PropTypes.element.isRequired,
  leftSidebar: PropTypes.element,
  rightSidebar: PropTypes.element,
  actionBar: PropTypes.node,
  content: PropTypes.element.isRequired,
  footer: PropTypes.node,
};

function Wrapper({ header, leftSidebar, actionBar, content, footer, rightSidebar }) {
  return (
    <MainWrapper>
      {header}
      <Contents>
        {leftSidebar}
        <PageContent actionBar={actionBar} footer={footer}>
          {content}
        </PageContent>
        {rightSidebar}
      </Contents>
    </MainWrapper>
  );
}

Wrapper.propTypes = propTypes;
Wrapper.Header = Header;
Wrapper.Sidebar = Sidebar;
Wrapper.ActionBar = ActionBar;

export default Wrapper;
