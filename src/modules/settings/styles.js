import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const ContentBox = styled.div`
  padding: ${coreSpace};
`;

const Margined = styled.div`
  padding: ${coreSpace};
  flex: 1;
  min-height: 100%;
  height: 100%;
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
  background-color: ${colors.colorPrimary};
  background-position: center;
  background-size: 46px;
  background-repeat: no-repeat;
  margin-top: ${unitSpace};
  position: relative;
  float: right;

  input[type='file'] {
    display: none;
  }

  .icon {
    margin: 0;
    visibility: hidden;
    transition: all 0.3s ease-in;
    transition-timing-function: linear;
    padding: 10px 19px;
    border-radius: 50%;
  }

  &:hover {
    .icon {
      visibility: visible;
      cursor: pointer;
    }
  }
`;

const WidgetPreviewStyled = styled.div`
  max-height: 430px;
  width: 280px;
  border-radius: 4px;
  background: ${colors.colorWhite};
  color: ${colors.colorWhite};
  display: flex;
  font-size: ${typography.fontSizeHeading8}px;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 15px 0 ${rgba(colors.colorBlack, 0.14)},
    0 1px 6px 0 ${rgba(colors.colorBlack, 0.06)};
`;

const LogoSpan = styled.span`
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
`;

const ColorPick = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 5px;
  border: 1px solid ${colors.colorShadowGray};
  cursor: pointer;
`;

const ColorPicker = styled.div`
  width: 80px;
  height: 15px;
`;

const WidgetApperance = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 100%;
`;

const WidgetSettings = styled.div`
  padding: 10px 30px 10px 10px;
`;

const WidgetBackgrounds = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const WidgetBox = styled.div`
  margin-bottom: ${coreSpace};
`;

const SubHeading = styled.h4`
  text-transform: uppercase;
  font-weight: ${typography.fontWeightMedium};
  border-bottom: 1 px dotted ${colors.colorShadowGray};
  padding-bottom: ${unitSpace};
  font-size: ${typography.fontSizeHeading8}px;
  margin: 0 0 ${coreSpace};
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};

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
  }
`;

const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${unitSpace};
  align-items: center;

  > div {
    margin-right: ${unitSpace};
  }
`;

const SubItem = styled.div`
  margin-bottom: ${coreSpace};
`;

const Well = styled.div`
  min-height: ${coreSpace};
  padding: ${coreSpace};
  margin-bottom: ${coreSpace};
  background-color: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};
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
    border: 1px solid #ddd;
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
    border-color: #ddd;
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    cursor: pointer;
  }
`;

export {
  ContentBox,
  SubHeading,
  MarkdownWrapper,
  InlineItems,
  SubItem,
  Well,
  Margined,
  WidgetApperance,
  WidgetPreviewStyled,
  WidgetSettings,
  WidgetBackgrounds,
  BackgroundSelector,
  WidgetBox,
  ColorPick,
  ColorPicker,
  LogoContainer,
  LogoSpan
};
