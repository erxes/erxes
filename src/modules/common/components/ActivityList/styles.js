import styled from 'styled-components';
import { colors, dimensions, typography } from 'modules/common/styles';
import { WhiteBox } from 'modules/layout/styles';

const iconWrapperWidth = '80px';

const Timeline = styled.div`
  padding-left: ${iconWrapperWidth};
  position: relative;

  &:before {
    border-right: 1px solid ${colors.colorLightGray};
    content: '';
    height: 100%;
    position: absolute;
    z-index: 1;
    left: calc(${iconWrapperWidth}/2);
  }
`;

const ActivityTitle = styled.h4`
  color: ${colors.textPrimary};
  padding: ${dimensions.unitSpacing}px 0;
  margin: 0;
  font-size: ${typography.fontSizeHeading4};
  line-height: ${typography.lineHeightHeading4};
`;

const ActivityRow = WhiteBox.extend`
  padding: ${dimensions.coreSpacing}px;
  position: relative;
  overflow: visible;
`;

const ActivityWrapper = styled.div`
  overflow: auto;
`;

const AvatarWrapper = styled.div`
  margin-right: ${dimensions.coreSpacing}px;
  float: left;

  a {
    float: none;
  }
`;

const ActivityIcon = styled.span`
  display: inline-block;
  position: absolute;
  background-color: ${props => props.color};
  height: calc(${iconWrapperWidth}/2);
  width: calc(${iconWrapperWidth}/2);
  line-height: calc(${iconWrapperWidth}/2);
  text-align: center;
  border-radius: 50%;
  left: calc(-${iconWrapperWidth} + ${iconWrapperWidth}/4);
  top: ${dimensions.coreSpacing}px;
  z-index: 2;

  & i {
    margin: 0;
    color: #fff;
  }
`;

const ActivityCaption = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
  font-weight: ${typography.fontWeightMedium};
  line-height: 1;
`;

const ActivityContent = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
  padding: ${dimensions.coreSpacing}px 0;
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const IconWrapper = styled.div`
  color: ${colors.colorLightGray};

  i {
    cursor: pointer;
  }
`;

const DeleteNote = styled.div`
  float: right;
`;

export {
  Timeline,
  ActivityTitle,
  ActivityRow,
  ActivityIcon,
  AvatarWrapper,
  ActivityWrapper,
  ActivityCaption,
  ActivityContent,
  IconWrapper,
  DeleteNote
};
