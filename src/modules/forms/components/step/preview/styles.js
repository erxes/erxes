import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { fadeIn } from 'modules/common/utils/animations';
import {
  SortableWrapper,
  SortItem,
  DragHandler
} from 'modules/common/styles/sort';

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

const PreviewWrapper = styled.div`
  padding: 0 !important;
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
      max-height: 350px;
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
  box-shadow: 3px 0px 5px ${rgba(colors.colorBlack, 0.25)};

  ${PreviewTitle} {
    text-align: inherit;
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

const CenterContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const FormContainer = styled.div`
  display: block;
  border-radius: ${dimensions.unitSpacing / 2}px;
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
  flex: 1;
  position: absolute;
  top: ${dimensions.unitSpacing}%;
  left: ${dimensions.unitSpacing / 2}%;
  width: 70%;
  background: ${colors.bgLight};
  padding: ${dimensions.unitSpacing / 2}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: 0 0 ${dimensions.unitSpacing}px ${colors.colorShadowGray} inset;
`;

const FieldItem = styled.div`
  padding: 0 ${dimensions.unitSpacing}px;

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
    margin-top: ${props => !props.selectType && '10px'};

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

const ThankContent = styled.div`
  text-align: center;
`;

export {
  PreviewTitle,
  PreviewBody,
  PreviewWrapper,
  DropdownContent,
  SlideLeftContent,
  BodyContent,
  CenterContainer,
  FormContainer,
  OverlayTrigger,
  Embedded,
  FieldItem,
  ThankContent
};
