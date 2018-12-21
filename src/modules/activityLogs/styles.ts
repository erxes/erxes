import { colors, dimensions, typography } from 'modules/common/styles';
import { WhiteBox } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const iconWrapperWidth = '80px';

const Timeline = styled.div`
  padding-left: ${iconWrapperWidth};
  position: relative;

  &:before {
    border-right: 1px solid ${colors.borderDarker};
    content: '';
    height: 100%;
    position: absolute;
    z-index: 1;
    left: calc(${iconWrapperWidth} / 2);
  }
`;

const ActivityTitle = styled.h5`
  color: ${colors.colorCoreGray};
  padding: ${dimensions.coreSpacing * 1.5}px 0 ${dimensions.coreSpacing}px 0;
  margin: 0;
  font-weight: 400;
  line-height: ${typography.lineHeightHeading4};
`;

const ActivityRow = styled(WhiteBox)`
  padding: ${dimensions.coreSpacing}px;
  position: relative;
  overflow: visible;

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
    color: ${colors.colorCoreGray};
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
  height: calc(${iconWrapperWidth} * 0.4);
  width: calc(${iconWrapperWidth} * 0.4);
  line-height: calc(${iconWrapperWidth} * 0.4);
  text-align: center;
  border-radius: 50%;
  left: calc(-${iconWrapperWidth} + ${iconWrapperWidth} * 0.3);
  top: ${dimensions.unitSpacing}px;
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

const ActivityContent = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  background: ${colors.bgInternal};
  box-shadow: 0 1px 2px 0 ${colors.darkShadow};
`;

const EmailContent = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px 0 60px;
  max-height: 110px;
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
