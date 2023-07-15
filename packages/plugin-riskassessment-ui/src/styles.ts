import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { colors, dimensions, WhiteBoxRoot } from '@erxes/ui/src';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { BoxRoot } from '@erxes/ui/src/styles/main';
import { highlight } from '@erxes/ui/src/utils/animations';
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

export const FormContainer = styledTS<{
  row?: boolean;
  column?: boolean;
  spaceBetween?: boolean;
  spaceAround?: boolean;
  gap?: boolean;
  gapBetween?: number;
  align?: string;
  justifyCenter?: boolean;
  flex?: boolean;
  maxItemsRow?: number;
  justify?: string;
  padding?: string;
  placeContent?: string;
  flexWrap?: boolean;
}>(styled.div)`
  display: flex;
  flex-wrap: wrap;
  padding:${({ padding }) => (padding ? padding : '')};
  flex-direction: ${({ row }) => row && 'row'} ${({ column }) =>
  column && 'column'};
  justify-content: ${({ spaceBetween }) =>
    spaceBetween ? 'space-between' : ''} ${({ spaceAround }) =>
  spaceAround ? 'space-around' : ''};
  gap: ${({ gap }) => (gap ? '25px' : '')};
  gap: ${({ gapBetween }) => (gapBetween ? `${gapBetween}px` : '')};
  place-items:${({ align }) => (align ? align : '')};
  justify-content:${({ justifyCenter }) => (justifyCenter ? 'center' : '')}; 
  justify-content:${({ justify }) => (justify ? justify : '')}; 
  place-content:${({ placeContent }) => (placeContent ? placeContent : '')};
  flex-wrap: ${({ flexWrap }) => (flexWrap ? 'wrap' : '')};
  ${({ flex }) =>
    flex
      ? `div {
        flex:  1
      }`
      : ''}
      ${({ maxItemsRow }) =>
        maxItemsRow
          ? `div {
        flex:  1 0 ${100 / maxItemsRow}%
      }`
          : ''}
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

export const ProductName = styledTS<{ pointer?: boolean; underline?: boolean }>(
  styled.a
)`
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

export const ColorBox = styledTS<{ color?: string; pointer?: boolean }>(
  styled.div
)`
  height: 10px;
  width: 10px;
  background-color: ${({ color }) => color}
  border-radius: 15px;
  ${({ pointer }) => (pointer ? 'cursor:pointer' : '')}
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
  min-width: 80px;
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

export const Typography = styledTS<{
  color?: string;
  bold?: boolean;
  fontSize: number;
}>(styled.div)`
  font-size: ${({ fontSize }) => `${fontSize}px`};
  font-weight: ${({ bold }) => (bold ? 'bold' : 'inheri')}}
  color: ${({ color }) => (color ? `${color}` : 'inherit')}
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

export const TriggerTabs = styled.div`
  .hxZkUW {
    border: 1px solid ${colors.borderPrimary};
    border-radius: 5px;
    padding: 2px;

    > span {
      flex: 1;
      flex-shrink: 0;
      text-align: center;
      font-weight: 500;
      padding: ${dimensions.unitSpacing - 4}px ${dimensions.coreSpacing}px
      border-radius: ${dimensions.unitSpacing - 5}px;

      &.active {
        background: ${colors.colorSecondary};
        color: ${colors.colorWhite};

        &:before {
          display: none;
        }
      }
    }
  }
`;

export const Divider = styled.div`
  &:before,
  &:after {
    content: '';
    flex: 1;
    height: 0;
    align-self: center;
    border-bottom: 1px solid ${colors.borderPrimary};
  }
`;
export const Features = styledTS<{ isToggled: boolean }>(styled.span)`
  transition: all ease .3s;
  filter: ${props => !props.isToggled && `blur(4px)`};
  pointer-events: ${props => !props.isToggled && `none`};
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

export const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select {
    min-width: 300px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }

  > h5 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;

export const Header = styled.h4`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorPrimary};
`;

export const BoardSelection = styled(BoardSelectContainer)`
  display: flex;
  gap: 15px;
  max-width: 300px;
  padding-right: 100px;
`;

export const SidebarHeader = styled.h5`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorPrimary};
  padding-left: 10px;
`;

export const FormContent = styled.div`
  animation: ${highlight} 0.9s ease;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
`;

export const RemoveRow = styled.div`
  color: ${colors.colorCoreRed};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;

export const CardBox = styled.div`
  text-align: center;
`;

export const TableRow = styled.tr`
  th,
  td {
    text-align: center;
  }

  th:last-child {
    border-right: none;
    text-align: center;
  }
  ,
  td:last-child {
    text-align: -webkit-center;
  }
`;

export const PlanCard = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  min-width: 400px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  border-radius: 15px;
  place-items: center;
  cursor: pointer;
  padding: 15px 25px;
  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;

export const PlanContainer = styled.div`
  height: 100%;
  > form {
    height: 100%;
  }
`;

export const DetailPopoverWrapper = styled.div`
  .popover {
    max-width: 550px;
  }
`;
