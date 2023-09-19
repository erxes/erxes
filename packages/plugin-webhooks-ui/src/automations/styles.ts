import { colors } from '@erxes/ui/src';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
export const ListItem = styledTS<{
  column?: number;
}>(styled.div)`
  background: ${colors.colorWhite};
  padding: 5px;
  margin-bottom: 10px;
  border-left: 2px solid transparent; 
  border-top: none;
  border-radius: 4px;
  box-shadow: none;
  left: auto;
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    box-shadow: 0 2px 8px ${colors.shadowPrimary};
    border-color: ${colors.colorSecondary};
    border-top: none;
  }
  ${props =>
    props.column &&
    css`
      width: ${100 / props.column}%;
      display: inline-block;
    `}
`;

export const FirstColumn = styled.div`
  flex: 20%;
  margin-right: 20px;
`;
export const EndColumn = styled.div`
  flex: 80%;
`;

export const Padding = styled.div`
  padding: 10px;
`;
