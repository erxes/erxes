import React from "react";
import styled from "styled-components";
import { colors, dimensions } from "modules/common/styles";
// import { MainHead } from "@erxes/ui/src/layout/styles";

const VerticalContent = styled.div`
  display: flex;
  flex-direction: column;
  background: ${colors.colorWhite};
  padding: ${dimensions.coreSpacing}px;
  position: relative;
`;

const Contents = styled.div`
  display: flex;
  flex: 1;
  background: ${colors.colorWhite};
  overflow: auto;
  margin-top: ${dimensions.coreSpacing}px;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow-x: auto;
  height: 100%;

  @-moz-document url-prefix() {
    overflow: hidden;
  }
`;

// const Contents = styled.div`
//   max-height: 100%;
//   background: #fff;
//   position: relative;
//   display: flex;
//   flex: 1;
//   padding: ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;

//   @-moz-document url-prefix() {
//     overflow: hidden;
//   }
// `;

const MainContent = styled.div`
  flex: 1;
  padding-right: ${dimensions.coreSpacing}px;
`;

type Props = {
  rightSidebar?: React.ReactNode;
  mainHead?: React.ReactNode;
  content: React.ReactNode;
};

class Wrapper extends React.Component<Props> {
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
