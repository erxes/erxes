import { colors, dimensions, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

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

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

const ModuleBox = styled.div`
  padding: ${coreSpace} 0 0 ${coreSpace};
`;

const LogoContainer = styled.div`
  color: ${colors.colorWhite};
  line-height: 56px;
  text-align: center;
  border-radius: 28px;
  width: 56px;
  height: 56px;
  cursor: pointer;
  box-shadow: 0 0 ${unitSpace} 0 ${rgba(colors.colorBlack, 0.2)};
  background-image: url('/images/erxes.png');
  background-color: ${colors.colorPrimary};
  background-position: center;
  background-size: 20px;
  background-repeat: no-repeat;
  margin-top: ${unitSpace};
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
    border-radius: ${unitSpace};
    text-align: center;
    line-height: ${coreSpace};
    font-size: ${unitSpace};
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

const ColorPick = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 3px;
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
`;

const ColorPicker = styled.div`
  width: 80px;
  height: 27px;
  border-radius: 2px;
`;

const WidgetApperance = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 100%;
  padding: ${coreSpace};
`;

const WidgetBackgrounds = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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

const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${unitSpace};
  align-items: center;
  justify-content: space-between;

  > div {
    margin-right: ${unitSpace};
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

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${props => props.isActive && colors.bgActive};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;

  a {
    white-space: normal;
    flex: 1;
    padding: 10px 0 10px 20px;
    font-weight: 500;

    &:hover {
      background: none;
    }

    &:focus {
      color: inherit;
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
      width: 35px;
    }
  }
`;

const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;

const ExpandWrapper = styled.div`
  flex: 1;
  margin-right: 20px;

  &:last-of-type {
    margin-right: 0;
  }
`;

export {
  ContentBox,
  ModuleBox,
  SubHeading,
  MarkdownWrapper,
  InlineItems,
  SubItem,
  WidgetApperance,
  WidgetBackgrounds,
  BackgroundSelector,
  ColorPick,
  ColorPicker,
  LogoContainer,
  SidebarListItem,
  ActionButtons,
  Description,
  ExpandWrapper
};
