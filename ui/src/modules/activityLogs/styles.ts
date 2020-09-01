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

const ActivityTitle = styled.h4`
  margin: 0;
  padding: ${dimensions.coreSpacing * 1.5}px 0 ${dimensions.coreSpacing}px;
  font-weight: 400;
  color: ${colors.textPrimary};
`;

const ActivityRow = styledTS<{ isConversation?: boolean }>(styled(WhiteBox))`
  padding: ${props => (props.isConversation ? '0' : dimensions.coreSpacing)}px;
  background: ${props => props.isConversation && colors.bgLight};
  position: relative;
  overflow: visible;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: 2px;
  height: auto;
  transition:height 0.3s ease-out;

  &:last-of-type {
    margin-bottom: 0;
  }

  &:hover {
    background: ${props => props.isConversation && colors.bgLightPurple};
  }
`;

const FlexCenterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FlexContent = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styledTS<{ isComplete?: boolean; isEditing: boolean }>(
  styled.div
)`
  position: relative;
  margin: ${dimensions.unitSpacing}px;
  flex: 1;
  font-size: 16px;

  > div {
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  h4 {
    text-decoration: ${props => props.isComplete && 'line-through'};
    transition: all ease 0.4s;

    > i {
      margin-right: 5px;
    }
  }

  .icon-edit {
    visibility: hidden;
    transition: all ease 0.3s;
    position: absolute;
    right: ${dimensions.unitSpacing}px;
    top: 5px;
  }

  &:hover {
    cursor: text;
    
    .icon-edit {
      visibility: ${props => !props.isEditing && 'visible'};
    }
  }
`;

const FlexBody = styled.div`
  flex: 1;
  align-self: center;
  word-break: break-word;

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

const Row = styled.div`
  margin-right: ${dimensions.coreSpacing}px;
`;

const AvatarWrapper = styledTS<{
  isOnline?: boolean;
  hideIndicator?: boolean;
  size?: number;
}>(styled.div)`
  margin-right: ${dimensions.unitSpacing * 1.5}px;
  position: relative;
  max-height: ${props => (props.size ? `${props.size}px` : '50px')};

  a {
    float: none;
  }

  &:before {
    content: '';
    position: absolute;
    right: -3px;
    top: 32px;
    background: ${props =>
      props.isOnline ? colors.colorCoreGreen : colors.colorShadowGray};
    width: 14px;
    height: 14px;
    border-radius: ${dimensions.unitSpacing}px;
    font-size: ${dimensions.unitSpacing}px;
    border: 1px solid ${colors.colorWhite};
    z-index: 1;
    display: ${props => props.hideIndicator && 'none'};
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
  margin-left: 5px;
  cursor: help;
`;

const ActivityContent = styledTS<{ isInternalNote?: boolean }>(styled.div)`
  margin-top: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  background: ${props =>
    props.isInternalNote ? colors.bgInternal : colors.borderPrimary};
  box-shadow: 0 1px 2px 0 ${colors.darkShadow};
  word-break:break-word;

  p:last-of-type {
    margin-bottom: 0;
  }

  img {
    max-width: 100%;
  }
`;

const EmailContent = styledTS<{ longEmail: boolean; expand: boolean }>(
  styled.div
)`
  margin-top: ${dimensions.unitSpacing}px;
  max-height: ${props => (props.expand ? 'auto' : '80px')};
  overflow: hidden;
  transition: height .5s;

  p {
    margin: 0;
  }
`;

const ExpandButton = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
  cursor: pointer;
  color: ${colors.colorCoreBlue};
  font-weight: 500;
  transition: all ease 0.4s;

  &:hover {
    text-decoration: underline;
  }
`;

const ContentShadow = styled.div`
  background-image: linear-gradient(rgba(255, 255, 255, 0), rgb(255, 255, 255));
  background-size: 100% 30px;
  height: 40px;
  position: absolute;
  bottom: 40px;
  left: 0px;
  right: 0px;
`;

const Date = styledTS<{ showDetail?: boolean }>(styled.div)`
  cursor: pointer;
  display: table;
  margin-right: ${dimensions.unitSpacing - 2}px;
  line-height: 33px;

  span {
    font-weight: 600;
    color: ${colors.colorCoreBlue};
  }

  i {
    margin-right: 5px;

    &:before {
      transition: all .15s ease-in-out;
      transform: ${props => props.showDetail && 'rotate(90deg)'};
    }
  }
`;

const Detail = styledTS<{ full?: boolean }>(styled.div)`
  margin-top: ${props =>
    props.full ? dimensions.coreSpacing : dimensions.unitSpacing}px;

  > p {
    margin: ${dimensions.unitSpacing}px 0 ${dimensions.coreSpacing}px;
  }
  `;

const IconWrapper = styledTS<{ isComplete?: boolean }>(styled.div)`
    cursor: pointer;

  > i {
    background: ${props =>
      props.isComplete ? colors.colorCoreGreen : colors.bgLight};
    color: ${props =>
      props.isComplete ? colors.colorWhite : colors.colorShadowGray};
    border-radius: 25px;
    display: inline-block;
    line-height: 25px;
    border: 2px solid ${props =>
      props.isComplete ? colors.colorCoreGreen : colors.colorShadowGray};
    transition: all ease 0.3s;
  }
`;

const Description = styled.div`
  padding: ${dimensions.unitSpacing}px;
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  margin: ${dimensions.coreSpacing}px 0;
`;

const DeleteAction = styled.div`
  color: ${colors.colorCoreRed};
  padding-right: ${dimensions.unitSpacing}px;
  cursor: pointer;
  visibility: hidden;
  transition: all 0.2s ease-in-out 0.2s;
  font-weight: 500;
`;

const JumpTo = styled(DeleteAction)`
  color: ${colors.colorCoreBlue};
  margin-right: ${dimensions.unitSpacing}px;
`;

const LogWrapper = styled.div`
  flex: 1;

  &:hover {
    ${DeleteAction} {
      visibility: visible;
    }
  }
`;

const ConversationContent = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90%;
`;

const Count = styled.div`
  text-align: center;
  border: 1px solid ${colors.colorShadowGray};
  border-radius: 2px;
  padding: 0 7px;
  color: ${colors.colorCoreGray};
`;

const Collapse = styled.div`
  padding: ${dimensions.coreSpacing}px;
  transition: all ease 0.5s;

  .dropdown {
    display: none;
  }
`;

const CollapseTrigger = styled.div`
  &:hover {
    cursor: pointer;
    opacity: 0.9;
  }
`;

const Header = styled(CollapseTrigger)`
  border-bottom: 1px solid ${colors.colorShadowGray};
  padding-bottom: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  font-size: 15px;
`;

const CenterText = styled.div`
  text-align: center;
  margin-top: ${dimensions.coreSpacing}px;
`;

const MergedContacts = styled.div`
  a {
    font-weight: 600;

    &:after {
      content: ', ';
    }

    &:last-child::after {
      content: '';
    }
  }
`;

const ShowMore = styled.span`
  color: #6569df;
  cursor: pointer;
  &:hover {
    color: black;
  }
`;

export {
  ShowMore,
  Timeline,
  ActivityTitle,
  ActivityRow,
  ActivityIcon,
  AvatarWrapper,
  ActivityDate,
  ActivityContent,
  Description,
  EmailContent,
  ConversationContent,
  FlexContent,
  FlexCenterContent,
  FlexBody,
  MergedContacts,
  Row,
  IconWrapper,
  Title,
  Date,
  Detail,
  ContentShadow,
  Count,
  LogWrapper,
  Collapse,
  Header,
  CenterText,
  ExpandButton,
  DeleteAction,
  JumpTo,
  CollapseTrigger
};
