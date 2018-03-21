import styled from 'styled-components';
import { colors, dimensions, typography } from 'modules/common/styles';
import { WhiteBox } from 'modules/layout/styles';

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
    left: calc(${iconWrapperWidth}/2);
  }
`;

const ActivityTitle = styled.h4`
  color: ${colors.colorCoreGray};
  padding: ${dimensions.coreSpacing * 1.5}px 0 ${dimensions.coreSpacing}px 0;
  margin: 0;
  font-weight: 400;
  line-height: ${typography.lineHeightHeading4};
`;

const ActivityRow = WhiteBox.extend`
  padding: ${dimensions.coreSpacing}px;
  position: relative;
  overflow: visible;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const ActivityWrapper = styled.div`
  overflow: auto;
`;

const AvatarWrapper = styled.div`
  margin-right: ${dimensions.coreSpacing}px;
  float: left;
  position: relative;

  a {
    float: none;
  }

  > i {
    position: absolute;
    right: -3px;
    bottom: 1px;
    background: ${props =>
      props.isUser ? colors.colorCoreGreen : colors.colorCoreRed};
    width: 18px;
    height: 18px;
    text-align: center;
    border-radius: ${dimensions.unitSpacing}px;
    color: ${colors.colorWhite};
    line-height: 15px;
    font-size: ${dimensions.unitSpacing}px;
    border: 2px solid ${colors.colorWhite};
  }
`;

const ActivityIcon = styled.span`
  display: inline-block;
  position: absolute;
  background-color: ${props => props.color};
  font-size: calc(${iconWrapperWidth} * 0.25);
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
    color: #fff;
  }
`;

const ActivityCaption = styled.div`
  padding-top: 5px;
  line-height: 1;
`;

const ActivityDate = styled.div`
  color: ${colors.colorCoreLightGray};
  font-weight: ${typography.fontWeightLight};
`;

const ActivityContent = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  margin-top: ${dimensions.coreSpacing}px;
  padding-top: ${dimensions.unitSpacing}px;
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
  ActivityWrapper,
  ActivityCaption,
  ActivityDate,
  ActivityContent,
  IconWrapper
};
