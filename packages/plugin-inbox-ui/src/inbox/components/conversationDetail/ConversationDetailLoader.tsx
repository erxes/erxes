import { colors, dimensions } from '@erxes/ui/src/styles';

import { Loader } from '@erxes/ui/src/styles/main';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Line = styledTS<{ width?: string; height?: string; round?: boolean }>(
  styled(Loader)
)`
  width: ${props => (props.width ? props.width : '100%')};
  height: ${props => (props.height ? props.height : '10px')};
  border-radius: ${props => props.round && '8px'};
  flex-shrink: 0;
`;

const Round = styledTS<{ volume?: string }>(styled(Loader))`
  width: ${props => (props.volume ? props.volume : '100%')};
  height: ${props => (props.volume ? props.volume : '100%')};  
  border-radius: 50%;     
  flex-shrink: 0;
`;

const FlexRow = styledTS<{ alignItems?: string }>(styled.div)`
  display: flex;
  align-items: ${props => (props.alignItems ? props.alignItems : 'center')};
`;

const FlexColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  > div {
    margin-bottom: ${dimensions.unitSpacing}px;
  }
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${dimensions.unitSpacing + 4}px ${dimensions.coreSpacing}px;
`;

const MainContent = styled.div`
  background: rgb(250, 250, 250);
  flex: 1 1 0%;
  height: calc(100% - 200px);
  padding: ${dimensions.coreSpacing}px;
`;

const EditorFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.colorWhite};
`;

const EditorContent = styled.div`
  height: 70px;
`;

const EditorTop = styled.div`
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  height: 36px;
`;

type Props = {
  loaderStyle?: any;
};

class ConversationDetailLoader extends React.Component<Props> {
  render() {
    return (
      <>
        <TopActionBar>
          <FlexRow>
            <Line width="60px" /> &emsp;
            <Round volume="26px" />
          </FlexRow>
          <FlexRow>
            <Line width="90px" height="27px" round={true} />
          </FlexRow>
        </TopActionBar>
        <MainContent>
          <FlexRow alignItems="flex-start">
            <Round volume="40px" /> &emsp;
            <FlexColumn>
              <Line width="90%" />
              <Line width="70%" />
              <Line width="60%" />
              <Line width="50%" />
            </FlexColumn>
          </FlexRow>
        </MainContent>
        <EditorFooter>
          <EditorTop />
          <EditorContent />
          <TopActionBar>
            <div />
            <Line width="90px" height="27px" round={true} />
          </TopActionBar>
        </EditorFooter>
      </>
    );
  }
}

export default ConversationDetailLoader;
