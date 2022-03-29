import React from "react";
import styled from "styled-components";

const Contents = styled.div`
  max-height: 100%;
  background: #fff;
  position: relative;
  display: flex;
  flex: 1;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  overflow-x: auto;

  @-moz-document url-prefix() {
    overflow: hidden;
  }
`;

const MainContent = styled.div`
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
