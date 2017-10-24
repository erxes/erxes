import styled from 'styled-components';
import { colors, dimensions } from '../../styles';

const inputPadding = '6px';
const inputHeight = '24px';
const inputScale = '14px';
const inputBorderWidth = '1px';

const Input = styled.input`
  display: block;
  border: none;
  width: 100%;
  margin-bottom: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  color: ${colors.textSecondary};
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${colors.colorWhite};

  &:focus {
    outline: none;
  }

  &:hover {
    color: ${colors.textPrimary};
    border-color: ${colors.colorCoreLightGray};
  }
`;

const Select = Input.withComponent('select').extend`
`;

const Textarea = Input.withComponent('textarea').extend`
	height: 80px;
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

const inputStyle = styled.input`
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  position: absolute !important;
  width: 1px !important;
  white-space: nowrap !important;

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
        border-color: ${colors.colorCoreLightGray};
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
    padding: 6px;
    user-select: none;

    &:before {
      background-color: ${colors.colorWhite};
      border: ${inputBorderWidth} solid ${colors.borderPrimary};
      box-sizing: content-box;
      content: '';
      color: ${colors.colorWhite};
      margin-right: calc(${inputHeight} * 0.25);
      top: 50%;
      left: 0;
      width: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: middle;
    }

    &:after {
      box-sizing: content-box;
      content: '';
      background-color: ${colors.colorWhite};
      position: absolute;
      top: 50%;
      left: calc(${inputPadding} + ${inputBorderWidth} + ${inputScale}/2);
      width: calc(${inputHeight} - ${inputScale});
      height: calc(${inputHeight} - ${inputScale});
      margin-top: calc((${inputHeight} - ${inputScale})/-2);
      transform: scale(0);
      transform-origin: 50%;
      transition: transform 200ms ease-out;
    }
  }
`;

const Radio = inputStyle.extend`
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
        background-color: ${colors.colorSecondary};
      }

      &:after {
        transform: scale(1);
      }
    }
  }
`;

const Checkbox = inputStyle.extend`
  + span {
    &:after {
      background-color: transparent;
      top: 50%;
      left: calc(${inputPadding} + ${inputBorderWidth} + ${inputHeight}/5);
      width: calc(${inputHeight}/2);
      height: calc(${inputHeight}/5);
      margin-top: calc(${inputHeight} / -2 / 2 * 0.8);
      border-style: solid;
      border-color: ${colors.colorWhite};
      border-width: 0 0 3px 3px;
      border-radius: 0;
      border-image: none;
      transform: rotate(-45deg) scale(0);
      transition: none;
    }
  }

  &:checked + span {

    &:before {
      animation: none;
      background-color: ${colors.colorSecondary};
    }

    &:after {
      content: '';
      transform: rotate(-45deg) scale(1);
      transition: transform 200ms ease-out;
    }
  }
`;

export { Input, Select, Textarea, Radio, Checkbox, FormLabel };
