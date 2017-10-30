import styled from 'styled-components';
import { colors, dimensions, typography } from '../../styles';

const inputPadding = '0px';
const inputHeight = '18px';
const inputScale = '12px';
const inputBorderWidth = '1px';

const Label = styled.label`
  text-transform: uppercase;
  display: inline-block;
  font-weight: ${typography.fontWeightRegular};
  color: ${colors.colorCoreLightGray};
  font-size: ${typography.fontSizeUppercase}px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  display: block;
  border: none;
  width: 100%;
  margin-bottom: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  color: ${colors.textSecondary};
  border-bottom: 1px solid ${colors.colorCoreLightGray};
  background: ${colors.colorWhite};

  ${props => {
    if (props.round) {
      return `
        font-size: 13px;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 5px 20px;
      `;
    }
  }};

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
    padding: ${inputPadding};
    user-select: none;

    &:before {
      background-color: ${colors.colorWhite};
      border: ${inputBorderWidth} solid ${colors.colorCoreLightGray};
      box-sizing: content-box;
      content: '';
      color: ${colors.colorWhite};
      margin-right: calc(${inputHeight} * 0.25);
      top: 50%;
      left: 0;
      width: ${inputHeight};
      height: ${inputHeight};
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

  + span:last-child:before {
    margin-right: 0px;
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
        border-color: transparent;
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
      left: calc(${inputPadding} + ${inputHeight}/5);
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
      border-color: transparent;
    }

    &:after {
      content: '';
      transform: rotate(-45deg) scale(1);
      transition: transform 200ms ease-out;
    }
  }
`;

export { Input, Select, Textarea, Radio, Checkbox, FormLabel, Label };
