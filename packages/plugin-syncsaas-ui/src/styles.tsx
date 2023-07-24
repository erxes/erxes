import { colors, dimensions } from '@erxes/ui/src';
import { highlight } from '@erxes/ui/src/utils/animations';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const SidebarHeader = styled.h5`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorPrimary};
  padding-left: 10px;
`;

export const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  > div {
    flex: 1;
    margin-right: 8px;
    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;

export const EndDateContainer = styled.div`
  .rdtPicker {
    left: -98px !important;
  }
`;

export const Card = styled.div`
  display: flex;
  width: 150px;
  height: 40px;
  text-align: center;
  margin-bottom: 5px;
  border-radius: 6px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  justify-content: center;
  place-items: center;
  cursor: pointer;
  gap: 5px;

  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;
`;

export const ClearableBtn = styled.a`
  cursor: pointer;
`;

export const Padding = styledTS<{
  horizontal?: boolean;
  vertical?: boolean;
  padding?: string;
}>(styled.div)`
  padding: ${({ horizontal, vertical, padding }) =>
    !horizontal && !vertical
      ? '10px'
      : `${vertical ? (padding ? `${padding}px` : '10px') : '0px'} ${
          horizontal ? (padding ? `${padding}px` : '10px') : '0px'
        }`}
`;

export const StepperContainer = styled.div`
  height: 100%;
  > form {
    height: 100%;
  }
`;
