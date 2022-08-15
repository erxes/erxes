import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { dimensions, colors } from '@erxes/ui/src';

export const GridContainer = styledTS<{ horizontal?: boolean; gap?: number; column?: number }>(
  styled.div
)`
    display:grid;
    gap:${(props) => props.gap || 0}
    grid-template-columns:${(props) =>
      props.column ? `repeat(${props.column},${100 / props.column}%)` : 'auto'}
`;

export const FormGroupRow = styledTS<{ horizontal?: boolean; spaceBetween?: boolean }>(styled.div)`
margin-bottom: 20px;
position: relative;

${(props) =>
  props.horizontal &&
  css`
    display: flex;
    align-items: center;
    ${(props) =>
      props.spaceBetween &&
      css`
        justify-content: space-between;
      `}

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
