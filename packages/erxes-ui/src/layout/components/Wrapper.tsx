import { FullContent, MiddleContent } from '../../styles/main';
import React from 'react';
import {
  Contents,
  HeightedWrapper,
  MainHead,
  VerticalContent
} from '../styles';
import FlowJobBar from './FlowJobBar';
import Header from './Header';
import PageContent from './PageContent';
import Sidebar from './Sidebar';

type Props = {
  header?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  flowJobBar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  transparent?: boolean;
  center?: boolean;
  shrink?: boolean;
  mainHead?: React.ReactNode;
  hasBorder?: boolean;
  noPadding?: boolean;
  initialOverflow?: boolean;
};

class Wrapper extends React.Component<Props> {
  static Header = Header;
  static Sidebar = Sidebar;
  static FlowJobBar = FlowJobBar;

  renderContent() {
    const {
      flowJobBar,
      content,
      footer,
      transparent,
      center,
      shrink,
      noPadding,
      initialOverflow
    } = this.props;

    if (center) {
      return (
        <FullContent center={true} align={true}>
          <MiddleContent shrink={shrink} transparent={transparent}>
            <PageContent
              flowJobBar={flowJobBar}
              footer={footer}
              transparent={transparent || false}
              center={center}
              noPadding={noPadding}
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
        flowJobBar={flowJobBar}
        footer={footer}
        transparent={transparent || false}
        noPadding={noPadding}
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
