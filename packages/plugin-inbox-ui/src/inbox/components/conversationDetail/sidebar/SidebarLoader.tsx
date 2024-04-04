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

const FlexRow = styledTS<{ alignItems?: string; justifyContent?: string }>(
  styled.div
)`
  display: flex;
  align-items: ${props => (props.alignItems ? props.alignItems : 'center')};
  justify-content: ${props => props.justifyContent && props.justifyContent};
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
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing + 6}px ${dimensions.coreSpacing}px;
`;

const MainContent = styled.div`
  padding: ${dimensions.coreSpacing + dimensions.unitSpacing}px
    ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;
`;

const Medium = styled.div`
  margin: 20px 0 0;
`;

const Box = styled.div`
  box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 6px 0px;
  position: relative;
  display: flex;
  flex: 1;
  padding: 15px 20px;
  height: 40px;
  margin: 10px 0;
`;

type Props = {
  loaderStyle?: any;
};

class SidebarLoader extends React.Component<Props> {
  render() {
    return (
      <>
        <TopActionBar>
          <Line width="40%" /> &emsp;
          <Line width="40%" />
        </TopActionBar>
        <MainContent>
          <FlexRow>
            <Round volume="50px" /> &emsp;
            <FlexColumn>
              <Line width="90%" />
              <Line width="70%" />
            </FlexColumn>
          </FlexRow>
          <Medium>
            <FlexRow alignItems="flex-start" justifyContent="space-between">
              <Line width="45px" height="27px" round={true} />
              <Line width="45px" height="27px" round={true} />
              <Line width="45px" height="27px" round={true} />
              <Line width="80px" height="27px" round={true} />
            </FlexRow>
          </Medium>
        </MainContent>
        <TopActionBar>
          <Line width="25%" /> &emsp;
          <Line width="25%" /> &emsp;
          <Line width="25%" />
        </TopActionBar>
        <Box>
          <Line width="35%" />
        </Box>
        <Box>
          <Line width="35%" />
        </Box>
        <Box>
          <Line width="35%" />
        </Box>
        <Box>
          <Line width="35%" />
        </Box>
      </>
    );
  }
}

export default SidebarLoader;
