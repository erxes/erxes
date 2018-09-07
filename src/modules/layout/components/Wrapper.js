import * as React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Sidebar from './Sidebar';
import PageContent from './PageContent';
import ActionBar from './ActionBar';
import { Contents } from '../styles';

const propTypes = {
  header: PropTypes.element.isRequired,
  leftSidebar: PropTypes.element,
  rightSidebar: PropTypes.element,
  actionBar: PropTypes.node,
  content: PropTypes.element.isRequired,
  footer: PropTypes.node,
  transparent: PropTypes.bool
};

function Wrapper({
  header,
  leftSidebar,
  actionBar,
  content,
  footer,
  rightSidebar,
  transparent
}) {
  return (
    <Contents>
      {header}
      {leftSidebar}
      <PageContent
        actionBar={actionBar}
        footer={footer}
        transparent={transparent || false}
      >
        {content}
      </PageContent>
      {rightSidebar}
    </Contents>
  );
}

Wrapper.propTypes = propTypes;
Wrapper.Header = Header;
Wrapper.Sidebar = Sidebar;
Wrapper.ActionBar = ActionBar;

export default Wrapper;
