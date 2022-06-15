import { colors, dimensions, typography } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { lighten } from '@erxes/ui/src/styles/ecolor';

const coreSpace = `${dimensions.coreSpacing}px`;

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

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  background: ${props => props.isActive && rgba(colors.colorPrimary, 0.2)};
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
    padding: 10px 0;

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

const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  flex: 1;
  margin-right: ${dimensions.coreSpacing}px;
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
  max-width: 640px;
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

const MarginRight = styled.div`
  margin-right: ${dimensions.unitSpacing}px;
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

export {
  MarkdownWrapper,
  FlexItem,
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
  MarginRight,
  CreatedDate
};
