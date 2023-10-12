import { colors, dimensions, typography } from '@erxes/ui/src/styles';

import { DateContainer } from '@erxes/ui/src/styles/main';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const coreSpace = `${dimensions.coreSpacing}px`;

const SpaceFormsWrapper = styled.div`
  > div {
    gap: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  }
`;

const CommentWrapper = styled.div`
  margin: ${dimensions.coreSpacing}px 0;
`;

const CreatedUser = styled.div`
  display: flex;
  position: relative;

  > div {
    flex: 1;
  }

  > img {
    width: 34px;
    height: 34px;
    border-radius: 34px;
    border: 2px solid #eee;
    margin-right: ${dimensions.unitSpacing}px;
  }

  span {
    font-size: 11px;
    color: ${colors.colorCoreGray};
    font-weight: 500;
    padding-left: ${dimensions.unitSpacing}px;
  }

  .actions {
    position: absolute;
    right: 0;
    top: 3px;
    visibility: hidden;
    text-transform: uppercase;

    > span {
      cursor: pointer;
      font-weight: 600;
      padding-left: 0;
      transition: all ease 0.1s;

      &:hover {
        color: ${colors.colorCoreRed};

        &:first-child {
          color: ${colors.colorCoreBlue};
        }
      }
    }
  }

  &:hover {
    .actions {
      visibility: visible;
    }
  }
`;
const TicketComment = styled.div`
  span {
    font-weight: bold;
    padding-right: 12px;
  }

  margin-bottom: ${dimensions.coreSpacing}px;
`;

const CommentContent = styled.div`
  background: rgb(239, 241, 243);
  border-radius: 5px;
  padding: 8px ${dimensions.unitSpacing}px;

  > h5 {
    font-size: 12px;
    color: rgb(58, 89, 153);
    font-weight: 600;
    margin: 0;
  }

  .comment {
    font-size: 12px;
    line-height: 16px;
    margin-top: 5px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;
  width: 0;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const SidebarListItem = styledTS<{
  isActive: boolean;
  backgroundColor?: string;
}>(styled.li)`
  position: relative;
  background: ${props =>
    (props.isActive && rgba(colors.colorPrimary, 0.2)) ||
    props.backgroundColor ||
    colors.colorWhite};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  a {
    white-space: normal;
    flex: 1;
    color: ${props => props.isActive && colors.colorPrimary} !important;
    font-weight: ${props => (props.isActive ? 600 : 500)};

    border-bottom: 1px solid ${colors.borderPrimary};

    margin: 0 20px;
    padding: 10px 0 !important;

    &:hover {
      background: none;
      color: ${props => !props.isActive && lighten(colors.textPrimary, 40)};
    }

    &:focus {
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  &:last-child {
    border: none;
  }
  
  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};
    
    ${ActionButtons} {
      width: 60px;
    }
  }
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.colorWhite};
  border: 1px solid ${colors.colorShadowGray};
  border-radius: 2px;
  margin: ${dimensions.unitSpacing - 5}px 0;

  > div {
    background: none;
  }

  button {
    position: absolute;
    right: ${coreSpace};
    top: ${coreSpace};
  }

  pre {
    border: none;
    background: none;
    margin: 0;
    padding: 20px;
  }
`;

const ExpandWrapper = styled.div`
  flex: 1;
  margin-right: 20px;

  &:last-of-type {
    margin-right: 0;
  }
`;

const Description = styledTS<{ noMargin?: boolean; halfWidth?: boolean }>(
  styled.div
)`
  color: ${colors.colorCoreGray};
  font-size: 12px;
  max-width: ${props => props.halfWidth && '500px'};
  margin-bottom: ${props => !props.noMargin && '20px'};
`;

const FlexRow = styledTS<{ alignItems?: string; justifyContent?: string }>(
  styled.div
)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: ${props => (props.alignItems ? props.alignItems : 'center')};
  justify-content: ${props =>
    props.justifyContent ? props.justifyContent : 'flex-start'};
  flex: 1;
  margin-right: ${dimensions.coreSpacing}px;

  > div {
    flex: 1;
    margin-right: ${dimensions.coreSpacing}px;

    &:last-child {
      margin: 0;
    }
  }
`;

const SubHeading = styled.h4`
  border-bottom: 1px dotted ${colors.colorShadowGray};
  padding-bottom: ${dimensions.unitSpacing}px;
  font-size: ${typography.fontSizeHeading7}px;
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px;
  color: ${colors.colorCoreDarkGray};

  span {
    display: block;
    text-transform: none;
    font-weight: normal;
    margin-top: ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
    font-size: 12px;
  }
`;

const WidgetBackgrounds = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const FlexItem = styled(DateContainer)`
  flex: 1;
  margin: 0;
  margin-left: ${dimensions.coreSpacing}px;
  &:first-child {
    margin-left: 0;
  }
`;

const BackgroundSelector = styled.div`
  border: 3px solid transparent;
  margin-right: 15px;
  border-radius: 4px;
  transition: border-color 0.3s;

  > div {
    width: 80px;
    height: 40px;
    margin: 5px;
    border: 1px solid ${colors.borderDarker};
    background-repeat: repeat;
    background-position: 0 0;
    background-size: 220%;

    &.background-1 {
      background-image: url('/images/patterns/bg-1.png');
    }

    &.background-2 {
      background-image: url('/images/patterns/bg-2.png');
    }

    &.background-3 {
      background-image: url('/images/patterns/bg-3.png');
    }

    &.background-4 {
      background-image: url('/images/patterns/bg-4.png');
    }

    &.background-5 {
      background: #faf9fb;
    }
  }

  &.selected {
    border-color: ${colors.borderDarker};
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    cursor: pointer;
  }
`;

const SubItem = styled.div`
  margin-bottom: ${coreSpace};

  img {
    background-color: ${colors.colorLightGray};
    max-height: 100px;
    margin-right: 5px;
  }

  i:hover {
    cursor: pointer;
  }

  label {
    display: block;
    margin-bottom: 10px;
  }
`;

const FilterContainer = styled.div`
  position: relative;
  z-index: 2;
`;

const SidebarList = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  margin: 0 auto;
`;

const LogoContainer = styled.div`
  color: ${colors.colorWhite};
  line-height: 56px;
  text-align: center;
  border-radius: 28px;
  width: 56px;
  height: 56px;
  cursor: pointer;
  box-shadow: 0 0 ${dimensions.unitSpacing}px 0 ${rgba(colors.colorBlack, 0.2)};
  background-image: url('/images/erxes.png');
  background-color: ${colors.colorPrimary};
  background-position: center;
  background-size: 20px;
  background-repeat: no-repeat;
  margin-top: ${dimensions.unitSpacing}px;
  position: relative;
  float: right;
  display: table;

  span {
    position: absolute;
    width: ${coreSpace};
    height: ${coreSpace};
    background: ${colors.colorCoreRed};
    display: block;
    right: -2px;
    top: -5px;
    color: ${colors.colorWhite};
    border-radius: ${dimensions.unitSpacing}px;
    text-align: center;
    line-height: ${coreSpace};
    font-size: ${dimensions.unitSpacing}px;
  }

  input[type='file'] {
    display: none;
  }

  label {
    display: block;
    margin: 0;
    visibility: hidden;
    border-radius: 50%;
  }

  &:hover label {
    visibility: visible;
    cursor: pointer;
  }
`;

const InputBar = styledTS<{ type?: string }>(styled.div)`
  background: ${colors.bgActive};
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  max-width: ${props =>
    props.type === 'active' && `${dimensions.headerSpacingWide * 2 + 20}px`};
  padding: 5px 5px 0 20px;
  border-radius: 8px;
  margin-left: ${props => props.type === 'active' && '10px'};
  height: 41px;
  padding-left: ${props =>
    props.type === 'searchBar' && `${dimensions.unitSpacing * 2}px`};

  input {
    border-bottom: 0;
  }
`;

const Header = styled.div`
  margin: 20px 20px 0px 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const Title = styledTS<{ capitalize?: boolean }>(styled.div)`
  font-size: 24px;
  display: flex;
  line-height: 30px;
  text-transform: ${props => props.capitalize && 'capitalize'};

  > span {
    font-size: 75%;
    color: #666;
  }
  `;

const CreatedDate = styled.div`
  float: left;
  font-size: 10px;
  margin-top: 10px;
  display: flex;
  > p {
    color: #000;
    margin-right: 5px;
  }
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

const FlexBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ItemCount = styled.span`
  color: ${colors.colorLightGray};
  font-weight: 500;
`;

const ImageWrapper = styled.div`
  margin-bottom: ${dimensions.unitSpacing}px;

  img {
    max-width: 300px;
    max-height: 300px;
  }
`;

export {
  MarkdownWrapper,
  FlexItem,
  ImageWrapper,
  ActionButtons,
  ExpandWrapper,
  Description,
  FlexRow,
  SubHeading,
  WidgetBackgrounds,
  SidebarListItem,
  BackgroundSelector,
  SubItem,
  FilterContainer,
  SidebarList,
  ContentBox,
  LogoContainer,
  InputBar,
  Header,
  Title,
  CreatedDate,
  LeftContent,
  Row,
  FlexBetween,
  ItemCount,
  SpaceFormsWrapper,
  CommentWrapper,
  TicketComment,
  CommentContent,
  CreatedUser
};
