import * as React from 'react';
import { Contents } from '../styles';
import ActionBar from './ActionBar';
import Header from './Header';
import PageContent from './PageContent';
import Sidebar from './Sidebar';

type Props = {
  header?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  actionBar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  transparent?: boolean;
};

class Wrapper extends React.Component<Props> {
  static Header = Header;
  static Sidebar = Sidebar;
  static ActionBar = ActionBar;

  render() {
    const {
      header,
      leftSidebar,
      actionBar,
      content,
      footer,
      rightSidebar,
      transparent
    } = this.props;

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
}

export default Wrapper;