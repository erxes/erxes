import { FullContent, MiddleContent } from '../../styles/main';
import React from 'react';
import {
  Contents,
  HeightedWrapper,
  MainHead,
  VerticalContent
} from '../styles';
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
      initialOverflow
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
      hasBorder
    } = this.props;

    return (
      <VerticalContent>
        {header}
        <MainHead>{mainHead}</MainHead>
        <HeightedWrapper>
          <Contents hasBorder={hasBorder}>
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
