import { Formgroup, Label } from 'modules/common/components/form/styles';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import {
  DragHandler,
  SortableWrapper,
  SortItem
} from 'modules/common/styles/sort';
import { fadeIn } from 'modules/common/utils/animations';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const PreviewTitle = styled.div`
  height: 50px;
  overflow: hidden;
  background-color: ${colors.colorSecondary};
  font-size: ${dimensions.coreSpacing - 5}px;
  line-height: 1.2em;
  display: flex;
  align-items: center;
  border-top-left-radius: ${dimensions.unitSpacing}px;
  border-top-right-radius: ${dimensions.unitSpacing}px;

  span {
    color: ${colors.colorWhite};
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    width: 100%;
    padding: 0 40px;
  }
`;

const PreviewBody = styledTS<{ embedded?: string }>(styled.div)`
  padding: ${dimensions.coreSpacing}px;
  color: ${colors.textPrimary};
  display: flex;
  overflow: auto;
  max-height: ${props => (props.embedded ? '500px' : '300px')};
  background-color: #faf9fb;

  img {
    max-width: 100px;
    margin-right: ${dimensions.unitSpacing}px;
  }

  button {
    width: 100%;
    display: block;
    outline: 0;
    border: 0;
    border-radius: ${dimensions.unitSpacing}px;
    padding: ${dimensions.unitSpacing - 2}px ${dimensions.coreSpacing}px;
    text-transform: inherit;
    margin-bottom: ${dimensions.coreSpacing - 5}px;

    &:hover {
      box-shadow: 0 2px 22px 0 hsl(0, 0%, 73%);
    }

    &:focus {
      outline: 0;
      color: ${colors.colorWhite};
    }
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
  border-top-left-radius: ${dimensions.unitSpacing}px;
  border-top-right-radius: ${dimensions.unitSpacing}px;
`;

const BodyContent = styled.div`
  flex: 1;

  span {
    padding-left: 5px;

    &:after {
      left: ${dimensions.unitSpacing - 1}px;
    }
  }

  p {
    color: #5c5c5c;
    margin-bottom: 10px;
    font-size: 14px;
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

const FormContainer = styled.div`
  display: block;
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

const FieldItem = styledTS<{ selectType?: boolean; noPadding?: boolean }>(
  styled.div
)`
  padding: ${props => !props.noPadding && `0 ${dimensions.unitSpacing}px`};

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

  input[type="checkbox"],
  input[type="radio"] {
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

  .required {
    color: ${colors.colorCoreRed};
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
