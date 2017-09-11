import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Sidebar from './Sidebar';
import PageContent from './PageContent';
import ActionBar from './ActionBar';
import { QuickNavigation } from '../containers';

const propTypes = {
  header: PropTypes.element.isRequired,
  leftSidebar: PropTypes.element,
  actionBar: PropTypes.node,
  content: PropTypes.element.isRequired,
  footer: PropTypes.node,
  rightSidebar: PropTypes.element,
  relative: PropTypes.bool,
};

function Wrapper({ header, leftSidebar, actionBar, content, footer, rightSidebar, relative }) {
  return (
    <div className="wrapper">
      {header}
      <div className="wrapper-content">
        {leftSidebar}
        <PageContent relative={relative} actionBar={actionBar} footer={footer}>
          {content}
        </PageContent>
        {rightSidebar}
      </div>
      <QuickNavigation />
    </div>
  );
}

Wrapper.propTypes = propTypes;
Wrapper.Header = Header;
Wrapper.Sidebar = Sidebar;
Wrapper.ActionBar = ActionBar;

export default Wrapper;
