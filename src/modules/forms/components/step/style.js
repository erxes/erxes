import styled, { keyframes } from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const StepItem = styled.div`
  transition: all 0.3s;
  width: ${props => (props.show ? '100%' : '70px')};
  box-shadow: 0 0 4px ${colors.colorShadowGray};
`;

const BoxRow = styled.div`
  margin-bottom: 20px;
`;

const FullStep = styled.div`
  background: ${colors.colorWhite};
  height: 100%;
  width: 100%;
  transition: all 0.3s;
  display: ${props => (props.show ? 'block' : 'none')};
`;

const StepHeaderContainer = styled.div`
  height: 55px;
  padding: 0 ${dimensions.coreSpacing}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
`;

const StepImg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  width: 35px;
  > img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const StepHeaderTitle = styled.div`
  margin-left: 10px;
`;

const StepContent = styled.div`
  width: 100%;
  height: calc(100% - 55px);
  overflow: hidden;
`;

const ShortStep = styled.div`
  width: 70px;
  height: 100%;
  background: ${colors.bgLight};
  cursor: pointer;
  display: ${props => (props.show ? 'flex' : 'none')};
  align-items: center;
  padding: 10px 0;
  flex-direction: column;
`;

const StepStatus = styled.div`
  margin-top: 20px;
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
  min-width: 500px;
  padding: ${dimensions.coreSpacing}px;
`;

const Preview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.coreSpacing}px;
`;

const Title = styled.label`
  display: block;
  margin: 20px 0 10px;
`;

const CenterContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  background: url('/images/preview.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

const Embedded = styled.div`
  flex: 1;
  margin: 20px;
  padding: 5px;
  box-shadow: 0 0 10px #edf1f5 inset;
`;

const FormContainer = styled.div`
  display: block;
  position: fixed;
  border-radius: 5px;
  background-color: ${colors.colorWhite};
  width: 500px;
  max-height: 400px;
  overflow: hidden;
  z-index: 2;
  animation: ${fadeIn} 0.5s linear;
`;

const PopupTitle = styled.div`
  padding: 20px;
  border-radius: 5px 5px 0 0;
  background-color: ${colors.colorSecondary};
  color: ${colors.colorWhite};
  text-align: center;
`;

const PreviewBody = styled.div`
  padding: 20px;
  color: ${colors.textPrimary};
  display: flex;
  overflow: auto;
  max-height: 300px;
  background: #fafafa;

  img {
    max-width: 100px;
    margin-right: 10px;
  }

  button {
    width: 100%;
    margin: 20px 0;
  }
`;

const BodyContent = styled.div`
  flex: 1;
`;

const BodyText = styled.span`
  display: block;
  margin-bottom: 20px;
`;

const BackgroundSelector = styled.li`
  display: inline-block;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 50%;
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : 'transparent')};

  > div {
    height: 30px;
    width: 30px;
    margin: 5px;
    background: #eee;
    border-radius: 50%;
    line-height: 30px;
    border: 1px solid #edf1f5;
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
  padding: 5px;
  border: 1px solid ${colors.colorShadowGray};
  cursor: pointer;
  margin: 0 20px 5px;
`;

const Picker = styled.div`
  width: 80px;
  height: 15px;
`;

const FormBody = styled.div`
  margin: 20px 0 10px;

  input {
    width: 100%;
    border-radius: 4px;
    display: block;
    border: 1px solid #ddd;
    padding: 6px 12px;
    outline: 0;
  }
`;

const FieldTitle = styled.div`
  color: #333;
  padding-bottom: 10px;
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

const DragHandler = styled.span`
  cursor: move;
  position: absolute;
  top: 8px;
  right: 20px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  opacity: 1;
  visibility: visible;
  border: 1px solid ${colors.borderPrimary};
  box-shadow: 0 0 4px ${colors.shadowPrimary};
  transition: all 0.3s ease;

  i {
    margin: 0;
    font-size: 16px;
  }
`;

const DragableItem = styled.div`
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);
  background-color: ${colors.bgLight};

  &:hover ${DragHandler} {
    opacity: 1;
    visibility: visible;
  }
`;

const PreviewForm = styled.div`
  margin-top: 20px;
  overflow: hidden;

  ${DragableItem} {
    box-shadow: none;
  }

  ${DragHandler} {
    opacity: 0;
    visibility: hidden;
  }
`;

const FieldItem = styled.div`
  &:hover {
    cursor: pointer;
  }

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
    margin-top: 10px;

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

const CarouselSteps = styled.div`
  text-align: center;
  padding: 20px;
  margin-top: 20px;
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: #fafafa;
  border: 1px solid #ddd;
`;

const ResolutionTabs = styled.div`
  margin-bottom: 20px;
  display: -webkit-inline-box;

  > div {
    padding: 5px 20px;
    border-radius: 5px;
    background-color: ${props =>
      props.selected
        ? rgba(colors.colorPrimary, 0.8)
        : rgba(colors.colorPrimary, 0.6)};
    color: ${colors.colorWhite};
    border: 1px solid ${colors.colorPrimary};
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
        !props.selected && rgba(colors.colorPrimary, 0.5)};
    }
  }
`;

const DesktopPreview = styled.div`
  border: 4px solid #ddd;
`;

const TabletPreview = styled.div`
  border: 4px solid #333;
`;

const MobilePreview = styled.div`
  border: 4px solid blue;
`;

export {
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepImg,
  StepHeaderTitle,
  StepContent,
  ShortStep,
  StepStatus,
  FlexItem,
  LeftItem,
  Preview,
  Title,
  CenterContainer,
  FormContainer,
  PreviewBody,
  PopupTitle,
  BodyText,
  ColorPick,
  ColorPicker,
  Picker,
  FieldTitle,
  BackgroundSelector,
  OverlayTrigger,
  BodyContent,
  Embedded,
  FormBody,
  BoxRow,
  PreviewForm,
  DragableItem,
  DragHandler,
  FieldItem,
  CarouselSteps,
  MarkdownWrapper,
  ResolutionTabs,
  DesktopPreview,
  TabletPreview,
  MobilePreview
};
