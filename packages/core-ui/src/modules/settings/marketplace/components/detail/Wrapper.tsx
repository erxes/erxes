import React from 'react';
import styled from 'styled-components';

import Header from 'modules/layout/components/Header';
import { colors, dimensions } from 'modules/common/styles';

const VerticalContent = styled.div`
  display: flex;
  flex-direction: column;
  background: ${colors.colorWhite};
  position: relative;
  height: 100%;
`;

const Contents = styled.div`
  display: flex;
  flex: 1;
  background: ${colors.colorWhite};
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow-x: hidden;
  height: 100%;
  padding: ${dimensions.coreSpacing}px;

  @-moz-document url-prefix() {
    // overflow: hidden;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding-right: ${dimensions.coreSpacing}px;
  overflow: hidden;
  height: 100%;
`;

type Props = {
  rightSidebar?: React.ReactNode;
  mainHead?: React.ReactNode;
  content: React.ReactNode;
};

class Wrapper extends React.Component<Props> {
  static Header = Header;
  render() {
    const { content, mainHead, rightSidebar } = this.props;

    return (
      <VerticalContent>
        {mainHead}
        <Contents>
          <MainContent>{content}</MainContent>
          {rightSidebar}
        </Contents>
      </VerticalContent>
    );
  }
}

export default Wrapper;
