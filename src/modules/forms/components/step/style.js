import styled, { keyframes } from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import {
  SortableWrapper,
  SortItem,
  DragHandler
} from 'modules/common/styles/sort';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const BoxRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-right: ${props => props.type && '20px'};
`;

const StepStatus = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
`;

const FlexItem = styled.div`
  display: flex;
  flex-direction: row;
  overflow: auto;
  height: 100%;
`;

const LeftItem = styled.div`
  position: relative;
  overflow: auto;
  flex: 0 0 33.33333%;
  min-width: 43.33333%;
  padding: ${dimensions.coreSpacing}px;
  opacity: ${props => props.deactive && '0.3'};
  cursor: ${props => props.deactive && 'not-allowed'};

  input:disabled {
    cursor: not-allowed;
  }
`;

const Preview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.coreSpacing}px;
  background: url('/images/previews/preview.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

const FullPreview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${dimensions.coreSpacing}px;
`;

const CenterContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Embedded = styled.div`
  flex: 1;
  position: absolute;
  top: 10%;
  left: 6%;
  width: 68%;
  background: ${colors.bgLight};
  padding: ${dimensions.unitSpacing / 2}px;
  box-shadow: 0 0 ${dimensions.unitSpacing}px ${colors.colorShadowGray} inset;
`;

const FormContainer = styled.div`
  display: block;
  border-radius: ${dimensions.unitSpacing / 2}px;
  background-color: ${colors.colorWhite};
  margin: auto;
  width: 70%;
  overflow: hidden;
  z-index: 1;
  animation: ${fadeIn} 0.5s linear;
`;

const PreviewTitle = styled.div`
  padding: ${dimensions.coreSpacing}px;
  background-color: ${colors.colorSecondary};
  color: ${colors.colorWhite};
  text-align: center;
`;

const PreviewBody = styled.div`
  padding: ${dimensions.coreSpacing}px;
  color: ${colors.textPrimary};
  display: flex;
  overflow: auto;
  max-height: ${props => (props.embedded ? '500px' : '300px')};
  background-color: ${colors.bgLight};

  img {
    max-width: 100px;
    margin-right: ${dimensions.unitSpacing}px;
  }

  button {
    width: 100%;
    margin: ${dimensions.coreSpacing}px 0;
  }
`;

const BodyContent = styled.div`
  flex: 1;

  ${SortableWrapper} {
    overflow: visible;
    max-height: none;

    ${SortItem} {
      background: none;
      margin: 0;
      padding: 0;
      border: 0;

      > div {
        width: 100%;
      }

      ${DragHandler} {
        position: absolute;
        top: ${dimensions.unitSpacing / 2}px;
        right: ${dimensions.unitSpacing}px;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        width: ${dimensions.headerSpacing - 20}px;
        height: ${dimensions.headerSpacing - 20}px;
        border-radius: 4px;
        opacity: 0;
        visibility: visible;
        border: 1px solid ${colors.borderPrimary};
        box-shadow: 0 0 4px ${colors.shadowPrimary};
        transition: all 0.3s ease;

        i {
          margin: 0;
          font-size: 16px;
        }
      }

      &:hover {
        ${DragHandler} {
          opacity: 1;
        }
      }
    }
  }
`;

const ThankContent = styled.div`
  text-align: center;
`;

const BodyText = styled.span`
  display: block;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const BackgroundSelector = styled.li`
  display: inline-block;
  cursor: pointer;
  margin-left: ${dimensions.unitSpacing}px;
  border-radius: 50%;
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : 'transparent')};

  > div {
    height: ${dimensions.headerSpacing - 20}px;
    width: ${dimensions.headerSpacing - 20}px;
    margin: ${dimensions.unitSpacing / 2}px;
    background: ${colors.borderPrimary};
    border-radius: 50%;
    line-height: ${dimensions.headerSpacing - 20}px;
  }

  &:first-child {
    margin: 0;
  }
`;
const ColorPick = styled.ul`
  list-style: none;
  padding: 0;
`;

const ColorPicker = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: ${dimensions.unitSpacing / 2}px;
  border: 1px solid ${colors.colorShadowGray};
  cursor: pointer;
  margin: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing / 2}px;
`;

const Picker = styled.div`
  width: 80px;
  height: 15px;
`;

const PreviewWrapper = styled.div`
  padding: 0 !important;
  overflow: auto;
`;

const DropdownContent = styled.div`
  flex: 1;
  box-shadow: 0 5px 8px ${colors.darkShadow};
  background: ${colors.bgLight};

  ${PreviewWrapper} {
    align-items: center;
    justify-content: center;

    ${PreviewBody} {
      padding: 10px 20px;
    }

    button {
      margin: 10px 0;
    }
  }
`;

const SlideLeftContent = styled.div`
  position: absolute;
  width: 60%;
  background: ${colors.bgLight};
  bottom: 0;
  left: 0;
  box-shadow: 3px 0px 5px rgba(0, 0, 0, 0.25);

  ${PreviewTitle} {
    text-align: inherit;
  }
`;

const FormBody = styled.div`
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px;

  input {
    width: 100%;
    border-radius: 4px;
    display: block;
    border: 1px solid ${colors.colorShadowGray};
    padding: 6px 12px;
    outline: 0;
  }
`;

const FieldTitle = styled.div`
  color: ${colors.colorCoreDarkGray};
  padding-bottom: ${dimensions.unitSpacing}px;
  text-transform: capitalize;
`;

const OverlayTrigger = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
`;

const DragableItem = styled.div`
  position: relative;
  z-index: 100;
  box-shadow: 0 2px ${dimensions.unitSpacing}px -3px rgba(0, 0, 0, 0.5);
  background-color: ${colors.bgLight};
`;

const FieldItem = styled.div`
  padding: ${dimensions.unitSpacing}px;

  input,
  textarea,
  select {
    border: 1px solid ${colors.colorShadowGray};
    border-radius: 4px;
    display: block;
    outline: 0;
    height: 34px;
    padding: 8px 14px;
    width: 100%;
    background: ${colors.colorWhite};
    margin-top: ${dimensions.unitSpacing}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }

    &:after {
      top: 22px;
    }
  }

  input[type='checkbox'],
  input[type='radio'] {
    width: auto;
    height: auto;
    display: inline-block;
    margin-right: 7px;
    padding: 0;
  }

  textarea {
    overflow: auto;
    height: auto;
  }
`;

const CarouselInner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: center;
  transition: all ease 0.3s;

  li {
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
    padding: ${dimensions.coreSpacing}px 0;

    span {
      padding: ${dimensions.unitSpacing}px;
      border-radius: 50%;
      background-color: rgb(255, 255, 255);
      border: 2px solid
        ${props =>
          props.selected ? colors.colorPrimary : colors.colorShadowGray};

      &:hover {
        cursor: pointer;
        border-color: ${props => !props.selected && colors.borderPrimary};
      }
    }

    &:before {
      flex: 1 1 100%;
      display: inline-block;
      border-top: 2px solid ${colors.borderDarker};
      content: ' ';
      width: 100%;
    }

    &:after {
      border-top: 2px solid ${colors.borderDarker};
      content: ' ';
      width: 100%;
    }
  }

  &:first-child {
    li {
      &:before {
        visibility: hidden;
      }
    }
  }

  &:last-child {
    li {
      &:after {
        visibility: hidden;
      }
    }
  }
`;

const CarouselSteps = styled.div`
  ol {
    list-style: none;
    padding: 0;
    justify-content: space-between;
    display: flex;
    flex: 1;
  }
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};
`;

const Tabs = styled.div`
  padding: ${dimensions.unitSpacing / 2}px ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.unitSpacing / 2}px;
  background-color: ${props =>
    props.selected
      ? rgba(colors.colorPrimaryDark, 0.8)
      : colors.colorPrimaryDark};
  color: ${colors.colorWhite};
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimaryDark : colors.colorPrimary)};
  transition: all ease 0.3s;

  &:first-child {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  &:not(:first-child):not(:last-child) {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }

  &:last-child {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }

  &:hover {
    cursor: pointer;
    background-color: ${props =>
      !props.selected && rgba(colors.colorPrimaryDark, 0.9)};
  }
`;

const ResolutionTabs = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  display: -webkit-inline-box;
`;

const DesktopPreview = styled.div`
  background: url('/images/previews/desktop.png') no-repeat;
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing / 2}px;
  flex: 1;
  padding-top: ${dimensions.headerSpacing - 20}px;

  ${PreviewBody} {
    max-height: 300px;
  }
`;

const TabletPreview = styled.div`
  background: url('/images/previews/tablet.png') no-repeat center center;
  width: 768px;
  height: 1024px;
  margin: 0 auto;
  padding: 80px ${dimensions.coreSpacing}px;
`;

const MobilePreview = styled.div`
  background: url('/images/previews/mobile.png') no-repeat;
  width: 376px;
  height: 650px;
  margin: 0 auto;
  padding: 90px ${dimensions.coreSpacing}px;

  ${PreviewBody} {
    max-height: 250px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 ${dimensions.coreSpacing}px;
  background: ${colors.bgLight};
  height: ${dimensions.headerSpacing}px;
  border-top: 1px solid ${colors.borderPrimary};

  label {
    margin-bottom: 0;
    margin-right: ${dimensions.coreSpacing}px;
  }
`;

const FlexColumn = styled.div`
  display: flex;
  min-width: 43.33333%;
  flex-direction: column;
  justify-content: space-between;

  ${LeftItem} {
    flex: 1;
  }
`;

export {
  StepStatus,
  FlexItem,
  LeftItem,
  Preview,
  CenterContainer,
  FormContainer,
  PreviewBody,
  PreviewTitle,
  BodyText,
  ColorPick,
  ColorPicker,
  Picker,
  FieldTitle,
  BackgroundSelector,
  OverlayTrigger,
  BodyContent,
  Embedded,
  DropdownContent,
  FormBody,
  BoxRow,
  DragableItem,
  DragHandler,
  FieldItem,
  CarouselSteps,
  MarkdownWrapper,
  ResolutionTabs,
  DesktopPreview,
  TabletPreview,
  MobilePreview,
  Tabs,
  CarouselInner,
  PreviewWrapper,
  SlideLeftContent,
  ThankContent,
  Footer,
  FullPreview,
  FlexColumn
};
