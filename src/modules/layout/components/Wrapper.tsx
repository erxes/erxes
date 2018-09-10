import * as React from "react";
import { Contents } from "../styles";
import ActionBar from "./ActionBar";
import Header from "./Header";
import PageContent from "./PageContent";
import Sidebar from "./Sidebar";

type Props = {
  header?: JSX.Element;
  leftSidebar?: JSX.Element;
  rightSidebar?: JSX.Element;
  actionBar?: JSX.Element;
  content: JSX.Element;
  footer?: JSX.Element;
  transparent?: boolean;
};

class Wrapper extends React.Component<Props, {}> {
  static Sidebar;
  static Header;
  static ActionBar;

  render() {
    const {
      header,
      leftSidebar,
      actionBar,
      footer,
      transparent,
      content,
      rightSidebar
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

Wrapper.Header = Header;
Wrapper.Sidebar = Sidebar;
Wrapper.ActionBar = ActionBar;

export default Wrapper;
