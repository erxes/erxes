import { FullContent, MiddleContent } from '@erxes/ui/src/styles/main';
import React from 'react';
import ActionBar from '@erxes/ui/src/layout/components/ActionBar';
import Header from '@erxes/ui/src/layout/components/Header';
import PageContent from './PageContent';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';

const VerticalContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: 100%;
  background: #fff;
  position: relative;
`;

const Contents = styled.div`
  display: flex;
  flex: 1;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  overflow-x: auto;

  @-moz-document url-prefix() {
    overflow: hidden;
  }
`;

const ContentBox = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
`;

type Props = {
  header?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  actionBar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  transparent?: boolean;
  mainHead?: React.ReactNode;
};

class Wrapper extends React.Component<Props> {
  static Header = Header;
  static Sidebar = Sidebar;
  static ActionBar = ActionBar;


  render() {
    const { leftSidebar, content, rightSidebar } = this.props;

    return (
      <VerticalContent>
        <Contents>
          {leftSidebar}
          <ContentBox>
            {content}
          </ContentBox>
        </Contents>
      </VerticalContent>
    );
  }
}

export default Wrapper;
