import { colors, dimensions, WhiteBoxRoot } from '@erxes/ui/src';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { BoxRoot } from '@erxes/ui/src/styles/main';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

export const GridContainer = styledTS<{
  horizontal?: boolean;
  gap?: number;
  column?: number;
}>(styled.div)`
    display:grid;
    gap:${props => props.gap || 0}
    grid-template-columns:${props =>
      props.column ? `repeat(${props.column},${100 / props.column}%)` : 'auto'}
`;

export const FormGroupRow = styledTS<{
  horizontal?: boolean;
  spaceBetween?: boolean;
}>(styled.div)`
margin-bottom: 20px;
position: relative;

${props =>
  props.horizontal &&
  css`
    display: flex;
    align-items: center;
    ${props =>
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

export const Padding = styledTS<{ horizontal?: boolean; vertical?: boolean }>(styled.div)`
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
  gapBetween?: number;
  align?: string;
  justifyCenter?: boolean;
}>(styled.div)`
  display: flex;
  flex-direction: ${({ row }) => row && 'row'} ${({ column }) => column && 'column'};
  justify-content: ${({ spaceBetween }) => (spaceBetween ? 'space-between' : '')} ${({
  spaceAround
}) => (spaceAround ? 'space-around' : '')};
  gap: ${({ gap }) => (gap ? '25px' : '')};
  gap: ${({ gapBetween }) => (gapBetween ? `${gapBetween}px` : '')};
  place-items:${({ align }) => (align ? align : '')};
  justify-content:${({ justifyCenter }) => (justifyCenter ? 'center' : '')}; 
`;

export const BoxItem = styled.div`
  flex-basis: 300px;
  padding: 25px 30px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 6px;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
  position: relative;

  h5 {
    margin: 0 0 5px;
    line-height: 22px;
    color: ${colors.colorPrimaryDark};
  }

  p {
    margin: 0;
    color: ${colors.colorCoreGray};
    word-break: break-word;
  }
`;

export const BarItem = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

export const ClearableBtn = styled.a`
  cursor: pointer;
`;

export const ProductName = styledTS<{ pointer?: boolean; underline?: boolean }>(styled.a)`
  cursor: pointer;
  color: ${colors.textSecondary};
  display: flex;
  justify-content: space-between;
  > i {
    visibility: hidden;
  }

  &:hover i {
    visibility: visible;
  }
`;

export const Badge = styledTS<{ color?: string }>(styled.div)`
  background-color: ${({ color }) => color}
  border-radius: 13px;
  text-align: center;
  color:white;
  max-width: 100px;
`;

export const ColorBox = styledTS<{ color?: string }>(styled.div)`
  height: 10px;
  width: 10px;
  background-color: ${({ color }) => color}
  border-radius: 15px
`;

export const ColorButton = styledTS<{ color?: string }>(styled.div)`
  height: 25px;
  border-radius: 2px;
  font-weight: 500;
  line-height: 25px;
  font-size: 12px;
  background-color: ${props => rgba(props.color || colors.colorPrimary, 0.1)};
  color: ${props => props.color || colors.colorPrimaryDark};
  padding: 0 10px;
  transition: background 0.3s ease;
  > i {
    margin-right: 5px;
  }
  > span {
    margin-right: 5px;
  }
  &:hover {
    cursor: pointer;
    background-color: ${props => rgba(props.color || colors.colorPrimary, 0.2)};
  }
`;
export const Box = styled(BoxRoot)`
  flex: 1;
  padding: ${dimensions.unitSpacing}px;
  text-align: center;
  background: ${colors.colorWhite};
  margin: 10px 10px 0 0;

  b {
    font-size: 26px;
    text-transform: uppercase;
    color: ${colors.colorCoreLightGray};
    line-height: 30px;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.textSecondary};
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

export const Typography = styledTS<{ color?: string; bold?: boolean; fontSize: number }>(
  styled.div
)`
  font-size: ${({ fontSize }) => `${fontSize}px`};
  font-weight: ${({ bold }) => (bold ? 'bold' : 'inheri')}}
  color: ${({ color }) => (color ? `${color}` : 'inherit')}
`;
