import React from "react";
import styled from "styled-components";
import { dimensions } from "modules/common/styles";

const Contents = styled.div`
  max-height: 100%;
  background: #fff;
  position: relative;
  display: flex;
  flex: 1;

  @-moz-document url-prefix() {
    overflow: hidden;
  }
`;

const MainContent = styled.div`
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px 0;
  padding: 0 ${dimensions.coreSpacing}px 0 0;
  flex: 1;
  overflow: auto;
`;

type Props = {
  leftSidebar?: React.ReactNode;
  content: React.ReactNode;
};

class Wrapper extends React.Component<Props> {
  render() {
    const { leftSidebar, content } = this.props;

    return (
      <Contents>
        {leftSidebar}
        <MainContent>{content}</MainContent>
      </Contents>
    );
  }
}

export default Wrapper;
