import { colors, dimensions, typography } from '@erxes/ui/src/styles';

import { WhiteBox } from '@erxes/ui/src/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const iconWrapperWidth = 80;

const ActivityRow = styledTS<{ isConversation?: boolean }>(styled(WhiteBox))`
  padding: ${props => (props.isConversation ? '0' : dimensions.coreSpacing)}px;
  background: ${props => props.isConversation && colors.bgLight};
  position: relative;
  overflow: visible;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: 5px;
  height: auto;
  transition:height 0.3s ease-out;

  &:last-of-type {
    margin-bottom: 0;
  }

  &:hover {
    background: ${props => props.isConversation && colors.bgLightPurple};
  }
`;

const ActivityIcon = styledTS<{ color?: string }>(styled.span)`
  display: inline-block;
  position: absolute;
  background-color: ${props => props.color};
  height: ${iconWrapperWidth * 0.4}px;
  width: ${iconWrapperWidth * 0.4}px;
  line-height: ${iconWrapperWidth * 0.4}px;
  text-align: center;
  border-radius: 50%;
  left: ${-iconWrapperWidth + iconWrapperWidth * 0.3}px;
  top: ${dimensions.coreSpacing}px;
  z-index: 2;

  & i {
    margin: 0;
    color: ${colors.colorWhite};
  }
`;

const ActivityDate = styled.div`
  color: ${colors.colorCoreGray};
  font-weight: ${typography.fontWeightLight};
  font-size: 11px;
  flex-shrink: 0;
  margin-left: ${dimensions.unitSpacing}px;
`;

const IMapActivityContent = styledTS<{ shrink: boolean }>(styled.div)`
  position: relative;
  overflow: hidden;
  border-radius: 5px;

  > button {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
  }

  ${props =>
    props.shrink &&
    `
    max-height: 200px;

    &:after {
      content: '';
      height: 100px;
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, rgba(255,255,255,0) 0%, ${colors.borderPrimary} 100%);
    }
  `}
`;

const SentWho = styled.div`
  margin-bottom: ${dimensions.unitSpacing}px;
  color: #666;

  strong {
    margin-right: ${dimensions.unitSpacing - 5}px;
  }
`;

const AcitivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export {
  ActivityRow,
  ActivityIcon,
  ActivityDate,
  AcitivityHeader,
  SentWho,
  IMapActivityContent
};
