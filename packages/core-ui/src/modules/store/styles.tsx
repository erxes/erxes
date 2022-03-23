import styled from 'styled-components';
import styledTS from "styled-components-ts";
import { colors, dimensions, typography } from "@erxes/ui/src/styles";
import { rgba } from '@erxes/ui/src/styles/ecolor';

const inputPadding = '0px';
const inputHeight = '15px';
const inputScale = '12px';
const inputBorderWidth = '2px';

const WidgetApperance = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 100%;
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
  cursor: ${props => props.disabled && 'not-allowed'}

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
        border-color: ${props =>
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
      border: ${inputBorderWidth} solid ${props =>
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
      border-radius: 50%;
      cursor: ${props => props.disabled && 'not-allowed'}
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
      background-color: ${props =>
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

export { WidgetApperance, Checkbox };