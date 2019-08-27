import { colors, dimensions, typography } from 'modules/common/styles';
import { WhiteBox } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const iconWrapperWidth = 80;

const Timeline = styled.div`
  padding-left: ${iconWrapperWidth}px;
  position: relative;

  &:before {
    border-right: 1px solid ${colors.borderDarker};
    content: '';
    height: 100%;
    position: absolute;
    z-index: 1;
    margin-top: 1px;
    left: ${iconWrapperWidth / 2}px;
  }
`;

const ActivityTitle = styled.h3`
  padding: ${dimensions.unitSpacing}px 0;
  font-weight: 300;
  color: ${colors.textPrimary};
`;

const ActivityRow = styled(WhiteBox)`
  padding: ${dimensions.coreSpacing}px;
  position: relative;
  overflow: visible;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: 3px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const FlexContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FlexBody = styled.div`
  flex: 1;
  align-self: center;

  p {
    margin: 0;
    font-weight: 500;
    font-size: 14px;
  }

  > div {
    font-size: ${typography.fontSizeHeading8}px;
  }

  span {
    padding-right: ${dimensions.unitSpacing}px;
  }
`;

const AvatarWrapper = styledTS<{ isUser?: boolean }>(styled.div)`
  margin-right: ${dimensions.coreSpacing}px;
  position: relative;

  a {
    float: none;
  }

  > i {
    position: absolute;
    right: -3px;
    top: 30px;
    background: ${props =>
      props.isUser ? colors.colorCoreGreen : colors.colorCoreRed};
    width: 18px;
    height: 18px;
    text-align: center;
    border-radius: ${dimensions.unitSpacing}px;
    color: ${colors.colorWhite};
    line-height: 16px;
    font-size: ${dimensions.unitSpacing}px;
    border: 1px solid ${colors.colorWhite};
  }

  > div {
    text-align: center;
    font-size: ${typography.fontSizeUppercase}px;
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
  font-size: 12px;
  margin-left: 5px;
  cursor: help;
`;

const ActivityContent = styledTS<{ isInternalNote: boolean }>(styled.div)`
  margin-top: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  background: ${props =>
    props.isInternalNote ? colors.bgInternal : colors.borderPrimary};
  box-shadow: 0 1px 2px 0 ${colors.darkShadow};

  p:last-of-type {
    margin-bottom: 0;
  }
`;

const EmailContent = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px 0 60px;
  overflow: hidden;
`;

const IconWrapper = styled.div`
  color: ${colors.colorLightGray};

  i {
    cursor: pointer;
  }
`;

export {
  Timeline,
  ActivityTitle,
  ActivityRow,
  ActivityIcon,
  AvatarWrapper,
  ActivityDate,
  ActivityContent,
  EmailContent,
  IconWrapper,
  FlexContent,
  FlexBody
};
