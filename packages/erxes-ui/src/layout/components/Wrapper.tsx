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
  subheader?: React.ReactNode;
  settings?: boolean;
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
      subheader
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
              subheader={subheader}
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
        subheader={subheader}
      >
        {content}
      </PageContent>
    );
  }

  render() {
    const { header, leftSidebar, rightSidebar, mainHead, settings } = this.props;

    return (
      <VerticalContent settings={settings}>
        {header}
        <MainHead settings={settings}>{mainHead}</MainHead>
        <HeightedWrapper settings={settings}>
          <Contents settings={settings}>
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
