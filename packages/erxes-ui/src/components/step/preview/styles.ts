import { Formgroup, Label } from '../../form/styles';
import { colors, dimensions } from '../../../styles';
import { rgba } from '../../../styles/ecolor';
import {
  DragHandler,
  SortableWrapper,
  SortItem
} from '../../../styles/sort';
import {
  fadeIn,
  slideDown,
  slideLeft,
  slideRight
} from '../../../utils/animations';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { LogoContainer } from '@erxes/ui-settings/src/styles';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const PreviewTitle = styled.div`
  background-color: ${colors.colorSecondary};
  border-top-left-radius: ${dimensions.unitSpacing}px;
  border-top-right-radius: ${dimensions.unitSpacing}px;

  > div {
    height: ${dimensions.headerSpacing}px;
    color: ${colors.colorWhite};
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    padding: 13px 40px 0;
    font-size: ${dimensions.coreSpacing - 5}px;
  }
`;

const PreviewBody = styledTS<{ embedded?: string }>(styled.div)`
  padding: ${dimensions.coreSpacing}px;
  color: ${colors.textPrimary};
  background-color: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  overflow: auto;

  button {
    width: 100%;
    border-radius: 5px;
    padding: 8px ${dimensions.coreSpacing}px;
    text-transform: inherit;

    &:hover {
      box-shadow: 0 2px 22px 0 hsl(0, 0%, 73%);
    }

    &:focus {
      outline: 0;
      color: ${colors.colorWhite};
    }
  }
`;

const DropdownContent = styled.div`
  box-shadow: 0 3px 20px -2px ${rgba(colors.colorBlack, 0.3)};
  background: ${colors.bgLight};
  transition: all 0.2s linear;
  border-radius: ${dimensions.unitSpacing}px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  animation: ${slideDown} 0.5s linear;
`;

const SlideLeftContent = styled.div`
  position: absolute;
  width: 380px;
  background: ${colors.bgLight};
  bottom: 20px;
  left: 20px;
  box-shadow: 0 3px 20px 0px ${rgba(colors.colorBlack, 0.3)};
  border-radius: ${dimensions.unitSpacing}px;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${slideLeft} 0.5s linear;

  @media (max-width: 1300px) {
    width: 100%;
  }
`;

const SlideRightContent = styled(SlideLeftContent)`
  right: 20px;
  left: auto;
  animation: ${slideRight} 0.5s linear;
`;

const BodyContent = styled.div`
  span {
    &:after {
      left: ${dimensions.unitSpacing - 1}px;
    }
  }

  input,
  textarea {
    margin-top: 5px !important;
  }

  ${Formgroup} {
    margin-bottom: 15px;
  }

  ${Label} {
    text-transform: inherit;
    color: ${colors.colorCoreBlack};
    font-size: 13px;
  }

  ${SortableWrapper} {
    overflow: visible;
    max-height: 100%;

    ${SortItem} {
      background: none;
      margin: 0;
      padding: 0;
      border: 0;

      > div {
        width: 100%;
        flex: 1;
      }

      ${DragHandler} {
        position: absolute;
        background: ${colors.colorWhite};
        top: 0;
        right: 0;
        margin-right: 0;
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

const CenterContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const CallOutBody = styledTS<{ imgSize?: string }>(styled.div)`
  color: #5c5c5c;
  font-size: 14px;
  display: inline-block;
  margin-bottom: ${dimensions.unitSpacing}px;

  img {
    width: ${props => props.imgSize || '100%'};
    float: left;
    margin-right: ${dimensions.unitSpacing}px;
    padding-bottom: ${props => props.imgSize === '100%' && '10px'};
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  height: 100%;
  padding: 20px;
`;

const PopUpContainer = styled.div`
  border-radius: ${dimensions.unitSpacing}px;
  background-color: ${colors.colorWhite};
  margin: ${dimensions.coreSpacing}px auto;
  width: 70%;
  overflow: hidden;
  z-index: 1;
  animation: ${fadeIn} 0.5s linear;

  ${PreviewBody} {
    max-height: 400px;
  }
`;

const OverlayTrigger = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
`;

const Embedded = styled.div`
  position: absolute;
  top: ${dimensions.unitSpacing}%;
  left: ${dimensions.unitSpacing / 2}%;
  width: 70%;
  background: ${colors.bgLight};
  padding: ${dimensions.unitSpacing / 2}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: 0 0 ${dimensions.unitSpacing}px ${colors.colorShadowGray} inset;
  max-height: 90%;
  display: flex;
  border-radius: ${dimensions.unitSpacing}px;
  flex-direction: column;

  @media (max-width: 1300px) {
    width: 90%;
  }
`;

const ThankContent = styled.div`
  text-align: center;
`;

const PrintButton = styled.div`
  button {
    margin-right: ${dimensions.unitSpacing}px;
    float: right;

    i:before {
      font-size: ${dimensions.coreSpacing}px;
    }
  }
`;

const Launcher = styled(LogoContainer)`
  position: absolute;
  right: ${unitSpace};
  bottom: ${unitSpace};
`;

const LauncherContainer = styled(Launcher)`
  position: absolute;
`;

const WidgetPreviewStyled = styled.div`
  background: ${colors.colorWhite};
  color: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  border-bottom-right-radius: 25px;
  bottom: 80px;
  box-shadow: 0 2px 16px 1px ${rgba(colors.colorBlack, 0.2)};
  display: flex;
  flex-direction: column;
  height: calc(100% - 95px);
  max-height: 660px;
  overflow: hidden;
  position: absolute;
  right: 8px;
  width: 380px;
  z-index: 1;
`;

const WidgetPreview = styled(WidgetPreviewStyled)`
  height: auto;
  bottom: 90px;
  right: ${coreSpace};
  max-height: calc(100% - 95px);
  max-width: calc(100% - 40px);
`;

const WebPreview = styledTS<{ isEngage?: boolean }>(styled.div)`
  min-height: 100%;
  position: relative;
  background: linear-gradient(
    140deg,
    rgba(0, 0, 0, 0) 70%,
    rgba(0, 0, 0, 0.08) 95%,
    rgba(0, 0, 0, 0.1) 100%
  );
  width: ${props => props.isEngage && '100%'};
  .engage-message {
    > div:first-of-type {
      flex-shrink: 0;
      padding: ${coreSpace} ${coreSpace} 10px ${coreSpace};
    }
  }
`;

export {
  PreviewTitle,
  PreviewBody,
  CallOutBody,
  DropdownContent,
  SlideLeftContent,
  SlideRightContent,
  BodyContent,
  CenterContainer,
  PopUpContainer,
  OverlayTrigger,
  Embedded,
  ThankContent,
  PreviewContainer,
  PrintButton,
  LauncherContainer,
  WebPreview,
  WidgetPreview
};
