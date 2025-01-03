import { colors, dimensions, typography } from "../../styles";
import styled, { css } from "styled-components";

import { rgba } from "../../styles/ecolor";
import styledTS from "styled-components-ts";

const inputPadding = "0px";
const inputHeight = "15px";
const inputScale = "12px";
const inputBorderWidth = "2px";
const textInputHeight = "34px";

const Label = styledTS<{ $uppercase?: boolean }>(styled.label)`
  text-transform: ${(props) => (props.$uppercase ? "uppercase" : "none")};
  display: inline-block;
  font-weight: ${typography.fontWeightMedium};
  color: ${colors.textPrimary};
  font-size: ${typography.fontSizeUppercase}px;

  > span {
    color: ${colors.colorCoreRed};
  }
`;

const Formgroup = styledTS<{ $horizontal?: boolean }>(styled.div)`
  margin-bottom: 20px;
  position: relative;

  ${(props) =>
    props.$horizontal &&
    css`
      display: flex;
      align-items: center;

      label {
        margin-bottom: 0;
        margin-left: 10px;
      }
    `};

  > label {
    margin-right: ${dimensions.unitSpacing}px;
  }

  p {
    font-size: 12px;
    color: ${colors.colorCoreGray};
    margin-bottom: 5px;
  }
`;

const Input = styledTS<{
  round?: boolean;
  $hasError?: boolean;
  $boxView?: boolean;
  disabled?: boolean;
  align?: string;
  hideBottomBorder?: boolean;
}>(styled.input)`
  display: block;
  border: ${(props) => (props.$boxView ? "1px solid" : "none")};
  outline: 0;
  width: 100%;
  height: ${textInputHeight};
  padding: ${dimensions.unitSpacing}px 0;
  color: ${colors.textPrimary};
  border-bottom: ${(props) =>
    props.hideBottomBorder ? "none" : "1px solid #e9e9e9"};
  border-color:${(props) =>
    props.$hasError ? colors.colorCoreRed : colors.colorShadowGray};
  background: ${(props) => (props.disabled ? colors.bgActive : "none")};
  transition: all 0.3s ease;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};

  ${(props) => {
    if (props.round) {
      return `
        font-size: 13px;
        border: 1px solid ${colors.borderDarker};
        border-radius: 20px;
        padding: 5px 20px;
      `;
    }

    if (props.$boxView) {
      return `
        border-radius: 5px;
        padding: ${dimensions.unitSpacing}px;
        font-weight: 400;
      `;
    }

    return "";
  }};

  ${(props) => {
    if (props.align) {
      return `
        text-align: ${props.align};
      `;
    }

    return "";
  }};

  &:hover {
    border-color: ${colors.colorLightGray};
  }

  &:focus {
    outline: none;
    border-color: ${colors.colorSecondary};
  }

  ::placeholder {
    color: #aaa;
  }
`;

const SelectWrapper = styledTS<{ $hasError?: boolean; $boxView?: boolean }>(
  styled.div
)`
  overflow: hidden;
  border-bottom: ${(props) => !props.boxView && `1px solid ${props.$hasError ? colors.colorCoreRed : colors.colorShadowGray}`};
  width: 100%;
  height: ${textInputHeight};
  position: relative;

  &:after {
    position: absolute;
    right: 5px;
    top: 12px;
    content: '\\e9a6';
    font-size: 14px;
    display: inline-block;
    font-family: 'erxes';
    speak: none;
    color: ${colors.colorCoreGray};
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    text-rendering: auto;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
  }

  ${(props) => {
    if (props.$boxView) {
      return `
        border-radius: 5px;
        padding: 0 ${dimensions.unitSpacing}px;
        font-weight: 400;
        border: ${`1px solid ${colors.colorShadowGray}`};
      `;
    }

    return "";
  }};
`;

const Select = styled(Input).attrs({
  as: "select",
})`
  border: none;
  height: ${textInputHeight};
  padding: 0;
  width: calc(100% + ${dimensions.coreSpacing}px);
  -webkit-appearance: none;
  outline-: 0;
`;

const TextArea = styledTS<{
  maxHeight?: number;
}>(styled(Input))`
  transition: none;
  max-height: ${(props) => props.maxHeight && `${props.maxHeight}px`};
  min-height: 80px;
  resize: none;
`;

const FormLabel = styled.label`
  position: relative;
  display: inline-block;
  font-weight: normal;

  span {
    cursor: pointer;
    display: inline-block;
  }
`;

const inputStyle = styledTS<{ disabled?: boolean; color?: string }>(
  styled.input
)`
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  position: absolute !important;
  width: 1px !important;
  white-space: nowrap !important;
  cursor: ${(props) => props.disabled && "not-allowed"}

  &:focus {
    + span {
      &::before {
        box-shadow: 0 0 0 2px rgba(#333, 0.4) !important;
      }
    }
  }

  &:hover {
    + span {
      &::before {
        border-color: ${(props) =>
          props.color ? props.color : colors.colorLightGray};
      }
    }
  }

  &:active {
    + span {
      &::before {
        transition-duration: 0;
      }
    }
  }

  + span {
    position: relative;
    padding: ${inputPadding};
    user-select: none;

    &:before {
      background-color: ${colors.colorWhite};
      border: ${inputBorderWidth} solid ${(props) =>
        props.color ? rgba(props.color, 0.7) : colors.colorShadowGray};
      box-sizing: content-box;
      content: '';
      color: ${colors.colorWhite};
      margin-right: calc(${inputHeight} * 0.25);
      top: 53%;
      left: 0;
      width: ${inputHeight};
      height: ${inputHeight};
      display: inline-block;
      vertical-align: text-top;
      border-radius: 2px;
      cursor: ${(props) => props.disabled && "not-allowed"}
    }

    &:after {
      box-sizing: content-box;
      content: '';
      background-color: ${colors.colorWhite};
      position: absolute;
      top: 56%;
      left: calc(${inputPadding} + ${inputBorderWidth} + ${inputScale} / 2);
      width: calc(${inputHeight} - ${inputScale});
      height: calc(${inputHeight} - ${inputScale});
      margin-top: calc((${inputHeight} - ${inputScale}) / -2);
      transform: scale(0);
      transform-origin: 51%;
      transition: transform 200ms ease-out;
    }
  }

  + span:last-child:before {
    margin-right: 0px;
  }
`;

const Radio = styledTS<{ color?: string }>(styled(inputStyle))`
  + span {
    &::before,
    &::after {
      border-radius: 50%;
    }
  }

  &:checked {
    &:active,
    &:focus {
      + span {
        &::before {
          animation: none;
          filter: none;
          transition: none;
        }
      }
    }

    + span {
      &:before {
        animation: none;
        background-color: ${(props) =>
          props.color ? props.color : colors.colorSecondary};
        border-color: transparent;
      }

      &:after {
        transform: scale(1);
      }
    }
  }
`;

const Checkbox = styledTS<{ color?: string }>(styled(inputStyle))`
  + span {
    &:after {
      background-color: transparent;
      top: 53%;
      left: calc(1px + ${inputHeight} / 5);
      width: calc(${inputHeight} / 2);
      height: calc(${inputHeight} / 5);
      margin-top: calc(${inputHeight} / -2 / 2 * 0.8);
      border-style: solid;
      border-color: ${colors.colorWhite};
      border-width: 0 0 2px 2px;
      border-radius: 0;
      border-image: none;
      transform: rotate(-45deg) scale(0);
      transition: none;
    }
  }

  &:checked + span {
    &:before {
      animation: none;
      background-color: ${(props) =>
        props.color ? props.color : colors.colorSecondary};
      border-color: transparent;
    }

    &:after {
      content: '';
      transform: rotate(-45deg) scale(1);
      transition: transform 200ms ease-out;
    }
  }
`;

const Error = styled.label`
  color: ${colors.colorCoreRed};
  margin-top: ${dimensions.unitSpacing - 3}px;
  display: block;
  font-size: 12px;
`;

const Progress = styled.div`
  width: 100%;
  margin-bottom: ${dimensions.unitSpacing}px;

  span {
    margin-right: ${dimensions.unitSpacing}px;
  }

  b {
    margin-right: ${dimensions.unitSpacing}px;
  }

  & > div {
    margin-bottom: 5px;
    border-radius: 5px;
  }
`;

export {
  Input,
  SelectWrapper,
  Select,
  TextArea,
  Radio,
  Checkbox,
  FormLabel,
  Label,
  Formgroup,
  Error,
  Progress,
};
