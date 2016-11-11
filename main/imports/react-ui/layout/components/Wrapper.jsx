import React, { PropTypes } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import PageContent from './PageContent.jsx';
import ActionBar from './ActionBar.jsx';
import { QuickNavigation } from '../containers';


const propTypes = {
  header: PropTypes.element.isRequired,
  leftSidebar: PropTypes.element,
  actionBar: PropTypes.node,
  content: PropTypes.element.isRequired,
  footer: PropTypes.node,
  rightSidebar: PropTypes.element,
};

function Wrapper({ header, leftSidebar, actionBar, content, footer, rightSidebar }) {
  return (
    <div className="wrapper">
      {header}
      <div className="wrapper-content">
        {leftSidebar}
        <PageContent actionBar={actionBar} footer={footer}>
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
