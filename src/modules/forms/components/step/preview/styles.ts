import {
  Formgroup,
  Label,
  SelectWrapper
} from 'modules/common/components/form/styles';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import {
  DragHandler,
  SortableWrapper,
  SortItem
} from 'modules/common/styles/sort';
import {
  fadeIn,
  slideDown,
  slideLeft,
  slideRight
} from 'modules/common/utils/animations';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
  border-radius: ${dimensions.coreSpacing}px;
  overflow: auto;
  height: 100%;

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
  border-top-left-radius: ${dimensions.unitSpacing}px;
  border-top-right-radius: ${dimensions.unitSpacing}px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  animation: ${slideDown} 0.5s linear;
`;

const SlideLeftContent = styled.div`
  position: absolute;
  width: 380px;
  background: ${colors.bgLight};
  bottom: 5px;
  left: 0;
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
  right: 0;
  left: auto;
  animation: ${slideRight} 0.5s linear;
`;

const BodyContent = styled.div`
  span {
    padding-left: 5px;

    &:after {
      left: ${dimensions.unitSpacing - 1}px;
    }
  }

  input,
  textarea {
    border-radius: ${dimensions.unitSpacing}px !important;
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

const CallOutBody = styled.div`
  color: #5c5c5c;
  font-size: 14px;
  display: inline-block;
  margin-bottom: ${dimensions.unitSpacing}px;

  img {
    max-width: 100px;
    float: left;
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  height: 100%;
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

const FieldItem = styledTS<{ selectType?: boolean; noPadding?: boolean }>(
  styled.div
)`
  padding: ${props => !props.noPadding && `0 ${dimensions.unitSpacing}px`};

  input,
  textarea,
  select {
    box-sizing: border-box;
    transition: all 0.3s ease-in-out;
    background: #faf9fb;
    border: 1px solid ${colors.colorShadowGray};
    border-radius: 5px !important;
    box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.07);
    color: #1a1a1a;
    display: block;
    font-size: 14px;
    height: 36px;
    line-height: 1.42857143;
    margin-top: ${props => !props.selectType && `${dimensions.unitSpacing}px`};
    outline: 0;
    padding: 6px 15px;
    width: 100%;


    &:focus {
      border-color: ${colors.colorShadowGray};
      background: ${colors.colorWhite};
    }

    &:after {
      top: 22px;
    }
  }

  textarea {
    overflow: auto;
    height: auto;
  }

  .required {
    color: ${colors.colorCoreRed};
  }

  ${SelectWrapper} {
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

const ThankContent = styled.div`
  text-align: center;
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
  FieldItem,
  ThankContent,
  PreviewContainer
};
