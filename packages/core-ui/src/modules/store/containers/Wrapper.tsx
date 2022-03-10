import { FullContent, MiddleContent } from '@erxes/ui/src/styles/main';
import React from 'react';
import {
  Contents,
  VerticalContent
} from '@erxes/ui/src/layout/styles';
import ActionBar from '@erxes/ui/src/layout/components/ActionBar';
import Header from '@erxes/ui/src/layout/components/Header';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';

const HeightedWrapper = styled.div`
    flex: 1;
    position: relative;
`;

const MainHead = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
`;

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
      shrink
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
    const { header, leftSidebar, rightSidebar, mainHead } = this.props;

    return (
      <VerticalContent>
        {header}
        <MainHead>{mainHead}</MainHead>
        <HeightedWrapper>
          <Contents>
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
