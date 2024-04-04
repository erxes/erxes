import {
  Contents,
  HeightedWrapper,
  MainHead,
  VerticalContent,
} from "../styles";
import { FullContent, MiddleContent } from "../../styles/main";

import ActionBar from "./ActionBar";
import Header from "./Header";
import PageContent from "./PageContent";
import React from "react";
import Sidebar from "./Sidebar";

type Props = {
  header?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  actionBar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  transparent?: boolean;
  center?: boolean;
  shrink?: boolean;
  mainHead?: React.ReactNode;
  initialOverflow?: boolean;
  hasBorder?: boolean;
};

class Wrapper extends React.Component<Props> {
  static Header = Header;
  static Sidebar = Sidebar;
  static ActionBar = ActionBar;

  renderContent() {
    const {
      actionBar,
      content,
      footer,
      transparent,
      center,
      shrink,
      initialOverflow,
    } = this.props;

    if (center) {
      return (
        <FullContent center={true} align={true}>
          <MiddleContent shrink={shrink} transparent={transparent}>
            <PageContent
              actionBar={actionBar}
              footer={footer}
              transparent={transparent || false}
              center={center}
              initialOverflow={initialOverflow}
            >
              {content}
            </PageContent>
          </MiddleContent>
        </FullContent>
      );
    }

    return (
      <PageContent
        actionBar={actionBar}
        footer={footer}
        transparent={transparent || false}
        initialOverflow={initialOverflow}
      >
        {content}
      </PageContent>
    );
  }

  render() {
    const {
      header,
      leftSidebar,
      rightSidebar,
      mainHead,
      hasBorder,
      initialOverflow,
    } = this.props;

    return (
      <VerticalContent>
        {header}
        {mainHead && <MainHead>{mainHead}</MainHead>}
        <HeightedWrapper>
          <Contents hasBorder={hasBorder} initialOverflow={initialOverflow}>
            {leftSidebar}
            {this.renderContent()}
            {rightSidebar}
          </Contents>
        </HeightedWrapper>
      </VerticalContent>
    );
  }
}

export default Wrapper;
