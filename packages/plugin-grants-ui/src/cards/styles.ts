import styledTS from 'styled-components-ts';
import styled, { css } from 'styled-components';
import { highlight } from '@erxes/ui/src/utils/animations';
import { colors } from '@erxes/ui/src';

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

export const Row = styled.div`
  display: flex;
  place-items: center;
  justify-content: space-between;
  gap: 5px;
  margin-top: 15px;
`;

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

export const RemoveRow = styled.div`
  color: ${colors.colorCoreRed};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;
