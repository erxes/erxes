import { colors, dimensions, WhiteBoxRoot } from '@erxes/ui/src';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

export const GridContainer = styledTS<{
  horizontal?: boolean;
  gap?: number;
  column?: number;
}>(styled.div)`
    display:grid;
    gap:${(props) => props.gap || 0}
    grid-template-columns:${(props) =>
      props.column ? `repeat(${props.column},${100 / props.column}%)` : 'auto'}
`;

export const FormGroupRow = styledTS<{
  horizontal?: boolean;
  spaceBetween?: boolean;
}>(styled.div)`
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

export const PreviewWrapper = styled(WhiteBoxRoot)`
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;

  > div {
    max-width: 400px;
  }
`;

export const ContentWrapper = styled.div`
  ${LeftItem} {
    padding: 20px 30px;
    flex: 0.5;
    min-width: auto;
  }
`;

export const Padding = styledTS<{ horizontal?: boolean; vertical?: boolean }>(
  styled.div
)`
  padding: ${({ horizontal, vertical }) =>
    !horizontal && !vertical
      ? '10px'
      : `${horizontal ? '10px' : '0px'} ${vertical ? '10px' : '0px'}`}
`;

export const FormContainer = styledTS<{
  row?: boolean;
  column?: boolean;
  spaceBetween?: boolean;
  spaceAround?: boolean;
  gap?: boolean;
}>(styled.div)`
  display: flex;
  flex-direction: ${({ row }) => row && 'row'} ${({ column }) =>
  column && 'column'};
  justify-content: ${({ spaceBetween }) =>
    spaceBetween ? 'space-between' : ''} ${({ spaceAround }) =>
  spaceAround ? 'space-around' : ''};
  gap: ${({ gap }) => (gap ? '25px' : '')}
`;
