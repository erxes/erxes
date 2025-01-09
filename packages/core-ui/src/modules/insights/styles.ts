import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import RGL, { WidthProvider } from 'react-grid-layout';

import { ContentBox, Contents } from '@erxes/ui/src/layout/styles';
import { lighten, rgba } from '@erxes/ui/src/styles/ecolor';
import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { colors, dimensions } from '@erxes/ui/src/styles';
import Table from '@erxes/ui/src/components/table';
import { FormLabel } from '@erxes/ui/src/components/form/styles';
import { StyledTable, TableWrapper } from '@erxes/ui/src/components/table/styles';
import { RightMenuContainer } from '@erxes/ui-sales/src/boards/styles/rightMenu';

const ReactGridLayout = WidthProvider(RGL);

const DragField = styledTS<{ haveChart?: boolean } & any>(
  styled(ReactGridLayout),
)`

  background-image: radial-gradient(
    ${colors.bgActive} 20%,
    ${colors.colorWhite} 20%
  );

  ${(props) => (props.haveChart ? '' : 'height: 100% !important')};
  min-height: 100% !important;
  
  background-size: 10px 10px;
  .react-grid-layout {
    
    position: relative;
    transition: height 200ms ease;
  }


  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    padding: 10px;
    box-shadow: 0px 2px 4px rgba(141, 149, 166, 0.1);
    border-radius: 4px;
    &:hover {
      border: 2px solid transparent;
      border-radius: 4px;
      border-color: ${colors.colorPrimary};
      .db-item-action {
        display: inline;
      }
    }

    > canvas {
      width: fit-content;
    }
  }

  .react-grid-item.cssTransforms {
    transition-property: transform;
  }

  .recharts-tooltip-wrapper{
    background-color:black
  }

  .react-grid-item.resizing {
    z-index: 1;
    will-change: width, height;
  }

  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }

  .react-grid-item.react-grid-placeholder {
 
    border: 2px solid transparent;
    border-style: dashed;
    border-radius: 4px;
    border-color: ${colors.colorPrimary};
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }

  // BOTTOM RIGHT
  .react-grid-item > .react-resizable-handle-se {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
  }

  // BOTTOM LEFT
  .react-grid-item > .react-resizable-handle-sw {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
  }

  // TOP RIGHT
  .react-grid-item > .react-resizable-handle-ne {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }

  // TOP LEFT
  .react-grid-item > .react-resizable-handle-nw {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }

  // RIGHT
  .react-grid-item > .react-resizable-handle-e {
    position: absolute;
    width: 20px;
    height: 100%;
    top: 0;
    right: 0;
    cursor: ew-resize;
  }

  // LEFT
  .react-grid-item > .react-resizable-handle-w {
    position: absolute;
    width: 20px;
    height: 100%;
    top: 0;
    left: 0;
    cursor: ew-resize;
  }

  // TOP
  .react-grid-item > .react-resizable-handle-n {
    position: absolute;
    width: 100%;
    height: 20px;
    top: 0;
    left: 0;
    cursor: ns-resize;
  }

  // BOTTOM
  .react-grid-item > .react-resizable-handle-s {
    position: absolute;
    width: 100%;
    height: 20px;
    bottom: 0;
    left: 0;
    cursor: ns-resize;
  }

  .react-grid-item:not(.react-grid-placeholder) {
      background: white;
  }
  
  .react-grid-item.static {
    border: 1px solid #eee;
    border-radius: 5px;

    .react-resizable-handle {
      display: none;
    }
  }
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  z-index: 1000;
  left: 0;
  right: 0;

  padding: 0 1.25rem 1.25rem 1.25rem;
  div {
    font-weight: 700;
    font-size: 1rem;
  }
  span {
    font-weight: 500;
    /* display:none; */
    cursor: pointer;
    margin-right: 0.5rem;
  }
  span:first-of-type {
    margin-left: auto;
    margin-right: 0.5rem;
    color: ${colors.colorPrimary};
  }
  span:last-of-type {
    color: ${colors.colorCoreRed};
  }
`;

const RightDrawerContainer = styledTS<{ width?: number } & any>(
  styled(RightMenuContainer),
)`
  background: ${colors.colorWhite};
  width: ${(props) =>
    props.width ? `calc(100% - ${props.width}px)` : '500px'};
  padding: ${dimensions.unitSpacing}px;
  z-index: 10;
  top: 0;
`;

const MarginY = styledTS<{ margin: number }>(styled.div)`
  margin: ${(props) => props.margin}px 0;
`;

const Description = styled.div`
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px;
  h4 {
    margin: 0;
    font-size: 16px;
  }

  > p {
    margin: ${dimensions.unitSpacing - 5}px 0 0 0;
    color: ${colors.colorCoreGray};
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Divider = styled.div`
  width: 1px;
  background-color: #e5e5ea;
  min-height: 100%;
  margin: 0 5px;
`;

const DateRangeWrapper = styled.div`
  width: 100%;
  min-width: 465px;
  min-height: 256px;
  display: flex;

  .rdtStatic {
    flex: 1;
    min-height: 100%;
  }

  .rdtPicker {
    min-height: 100%;
    box-shadow: unset !important;
    width: 100%;
    border: none !important;
    min-width: 220px;
    padding: 0 !important;
  }

  .rdtPicker .rdtDay {
    position: relative;
    transition: background-color 0.2s ease, color 0.2s ease-in-out;
    border-radius: 8px;

    &:after {
      content: '';
      border-radius: 8px;
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
    }
  }

  .rdtPicker .rdtDay:hover { 
    border-radius: 8px;
  }

  .rdtPicker .rdtDay.rdtInRange { 
    background-color: #8A8DD8 !important;
    color: #FFF;
    border-radius: 8px;
  }

  .rdtPicker td.rdtStart,
  .rdtPicker td.rdtStart:hover {
    background-color: ${colors.colorSecondary} !important;
    border-radius: 8px;
  }

  .rdtPicker td.rdtEnd,
  .rdtPicker td.rdtEnd:hover {
    background-color: ${colors.colorSecondary} !important;
    border-radius: 8px;
  }

  .rdtPicker td.rdtDay.rdtHover:not(.rdtActive):not(.rdtInRange) {
    background-color: #8A8DD8 !important;
    color: #FFF;
    border-radius: 8px;
  }
`;

const FlexColumn = styled.div`
  flex: 1 2;
  display: flex;
  flex-direction: column;
`;

const FlexCenter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 10px;
`;

const DetailBox = styled.ul`
  display: grid;
  column-gap: 10px;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 30px);
  list-style-type: none;
  align-items: center;
  margin: 0 5px;
  padding: unset;

  > li {
    text-align: left;

    &:nth-child(10) {
      grid-column: span 3;
    }
  }
`;

const DetailBoxContainer = styled.div`
  /* border: 1px solid #eee;
  border-radius: 5px; */

  /* margin: 0 20px; */
  /* padding: 5px 10px; */

  > div {
    margin-top: 10px;
    padding: 0 5px;
  }
`;

const FormContent = styled.div`
  padding: 10px 15px 0px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  height: calc(100vh - 74px);

  && .form-control,
  input {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 10px 5px;

    &:focus {
      border-color: ${colors.borderDarker};
    }
  }

  .css-13cymwt-control, .css-t3ipsp-control, .css-t3ipsp-control:hover {
    border-bottom: none;
  }

  > div {
    > label {
      margin-bottom: 5px;
    }

    .css-b62m3t-container {
      margin-bottom: 7px;
      border: 1px solid #eee;
      border-radius: 5px;
    }

    .css-13cymwt-control > div, .css-t3ipsp-control > div {
      margin: 5px 8px 5px 5px;
      padding: 0;
    }

    .css-1nmdiq5-menu {
      box-shadow: 0 4px 11px hsla(0, 0%, 0%, 0.1);
      border: 1px solid #eee;
    }

    .css-d7l1ni-option, .css-tr4s17-option {
      background-color: #F0F0F0;
      color: inherit;
    }

    .Select.is-focused > .Select-control,
    .Select.is-open > .Select-control {
      border-color: ${colors.borderDarker};
      border-radius: 5px;
    }

    .Select--multi .Select-multi-value-wrapper {
      padding: 0 5px 0 0;
      border-radius: 5px;
    }

    .Select-menu-outer {
      margin-top: 5px;
      border-radius: 5px;
      overflow: hidden;
    }

    .Select-option-group-label {
      position: unset;
      font-weight: 500;
    }

    .Select-option-group > .Select-option {
      padding-left: 30px;
    }

    .date-range {
      > div {
        gap: 10px;

        > .css-b62m3t-container {
          flex: 1;
        }

        > div:last-child {
          margin: 0 0 7px 0;
        }
      }
    }

    .date-range-popover {
      max-width: fit-content !important;
    }
  }
`;

const FormFooter = styled.footer`
  display: flex;
  padding: 10px 15px;

  > button {
    width: 100%;
  }
`;

const TemplateBox = styledTS<{ showMore: boolean }>(styled.div)`
  display: flex;
  gap: 10px;
  padding: 10px;
  flex-wrap: wrap;
  margin: 10px 0;
  border-radius: 3px;
  border: 1px solid #eee;


  &:before {
    content: '\\ec35';
    font-family: 'erxes';
    position: absolute;
    color: ${colors.colorCoreDarkBlue};
    font-size: 196px;
    transform: rotate(10deg);
    right: -15%;
    bottom: -80px;
    opacity: 0.06;
  }

  display: flex;
  justify-content: flex-start;
  border-style: dashed;
  border-width: 2px;

  &:before {
    content: '';
  }

  &:hover {
    border-color: ${colors.borderDarker};
    cursor: pointer;
  }

  h3 {
    margin: 0;
    font-size: 16px
  }

  > a,
  > div {
    flex-basis: 90%;
    display: flex;
    flex-shrink: 0;

    @media (min-width: 480px) {
      flex-basis: 70%;
    }

    @media (min-width: 768px) {
      flex-basis: 90%;
    }

    @media (min-width: 1170px) {
      flex-basis: 80%;
    }

    @media (min-width: 1400px) {
      flex-basis: 80%;
    }
  }

  > button {
    width: 100%;
    color: black;
  }

  > ul {
    ${(props) => !props.showMore && 'height: 88px'};
    transition: 0.5s ease;
    overflow: hidden;
    margin: unset;
    padding: unset;
    width: 100%;
  }
`;

const ContentContainer = styled(Contents)`
  margin: 0;

  > section {
    margin: 0;
  }
`;

const CustomOption = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  white-space: normal;
  /* color: #6a45e6; */
  color: ${colors.colorPrimary};

  .list-icon {
    margin-right: ${dimensions.unitSpacing - 5}px;
  }

  &:hover {
    cursor: pointer;
  }
`;

const Content = styled(ContentBox)`
  background-color: none;
  background-image: radial-gradient(black 20%, #fff 20%);
  background-size: 10px 10px;
`;

const SectionListWrapper = styled.ul`
  padding-left: 15px;
`;

const SectionListItem = styledTS<{
  isActive: boolean;
  backgroundColor?: string;
}>(styled.li)`
  position: relative;
  background: ${(props) =>
    (props.isActive && rgba(colors.colorPrimary, 0.2)) ||
    props.backgroundColor ||
    colors.colorWhite};
  overflow: hidden;
  display: flex;
  align-items: center;
  flex: 1;
  white-space: normal;
  padding: ${dimensions.unitSpacing - 2}px 0 ${dimensions.unitSpacing - 2}px ${
    dimensions.coreSpacing
  }px;

  span {
    flex: 1;
    width: auto;

  }

  span, i {
    color: ${(props) => props.isActive && colors.colorPrimary} !important;
  }
  
  a {
    white-space: normal;
    padding: 0;
    color: ${(props) => props.isActive && colors.colorPrimary} !important;
    font-weight: ${(props) => (props.isActive ? 500 : 400)};

    &:hover {
      background: none;
      color: ${(props) => !props.isActive && lighten(colors.textPrimary, 40)};
    }

    &:focus {
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  .list-icon {
    margin-right: ${dimensions.unitSpacing - 3}px;
    color: ${colors.colorCoreBlue};
  }

  .arrow-icon {
    margin-top: ${dimensions.unitSpacing - 8}px;
    margin-left: ${dimensions.unitSpacing - 5}px;
    color: ${colors.colorCoreLightGray};

    &:hover {
      color: ${colors.colorCoreBlack};
    }
  }

  &:last-child {
    border: none;
  }

  ${ActionButtons} {
    position:absolute;
    right : 0;
    width: 0px;
    z-index: 0;
  }
  
  &:hover {

    cursor: pointer;
    background: ${(props) => !props.isActive && colors.bgLight};
    
    ${ActionButtons} {
      position:absolute;
      right : 0;
      width: 40px;
      z-index: 1;
      background: ${(props) => (props.isActive ? '#e2dcf2' : colors.bgLight)};
    }
  }
`;

const Title = styledTS<{ isOpen: boolean }>(styled.p)`
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  ${(props) =>
    props.isOpen ? 'overflow-wrap: break-word' : 'white-space: nowrap'};
  margin: unset;
`;

const FormChart = styled.div`
  background-image: radial-gradient(
    ${colors.bgActive} 20%,
    ${colors.colorWhite} 20%
  );

  background-size: 10px 10px;
  height: 100% !important;

  box-shadow: 1px 4px 16px rgba(141, 149, 166, 0.1);
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 2rem;
  padding-top: 4rem;
`;

const FormWrapper = styled.div`
  display: flex;

  .left-column .canvas {
    display: flex;
    justify-content: center;
    padding: 50px;
  }

  .right-column {
    max-width: 500px !important;
  }
`;

const ControlRange = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;

  padding-top: 5px;
`;

const ChartTable = styled(Table)`

  thead {
    background-color: #fff;
    position: sticky;
    top: 0;
  }

  th:first-child {
    padding-left: 15px;
  }

  th:last-child {
    display: flex;
    justify-content: end;
    
    div {
      position: relative;
      top: -2px;
    }
  }
`;

const PivotTable = styled(StyledTable)`

  th, td {
    padding-top: 9px;
    padding-bottom: 9px;
  }

  .pl-0 {
    padding-left: 0;
  }

  .total {
    font-weight: bold;
  }

  .subTotal {
    font-weight: bold;
  }

  .sticky-col {
    position: sticky;
    background-color: white;
    left: 0;
    z-index: 10;
  }

  thead {
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 11;
  }

  tr:first-child {

    th:last-child {
      text-align: left;
      padding: 8px 18px 8px 0;
    }
  }
`;

const ScrollWrapper = styled.div`
  height: 100%;
  overflow: auto;

  ${TableWrapper} {
    padding: 0 !important;
  }
`;

const MultiValue = styled.div`
    display: flex !important;
    gap: 10px !important;
    background-color: ${colors.colorSecondary} !important;
    border-radius: 11px !important;
    border: 1px solid ${colors.colorSecondary};
    color: ${colors.colorWhite};
    margin-bottom: 5px !important;
    margin-left: 0 !important;
    margin-right: 5px !important;
    position: relative;
    padding: 5px 10px 5px 10px !important;

    label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-radius: 2px;
      font-size: 11px;
      box-sizing: border-box;
      color: #FFF !important;
      padding: 2px !important;
    }
`;

const MultiValueContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const ValueOption = styled.div`
    align-items: center;
`;

const OptionLabel = styled(FormLabel)`
    user-select: none;
    display: flex;
    align-items: center;
    gap: 5px;
`;

const Checkbox = styled.input`
  -webkit-appearance: none;
  appearance: none !important;
  border: none !important;
  padding: 0 !important;

  background-color: #fff;
  display: inline-block;
  width: 16px;
  height: 16px;
  position: relative;
  vertical-align: middle;
  cursor: pointer;
  border-radius: 5px;

  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 11px;
    height: 11px;
    border-radius: 3px;
    background-color: transparent;
    transform: translate(-50%, -50%) scale(0); 
    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
  }

  &:checked:before {
    transform: translate(-50%, -50%) scale(1);
    background-color: #6569DF;
  }
`;

export {
  DragField,
  ChartTitle,
  RightDrawerContainer,
  MarginY,
  Description,
  FlexRow,
  FlexColumn,
  FlexCenter,
  DetailBox,
  DetailBoxContainer,
  FormContent,
  FormFooter,
  TemplateBox,
  ContentContainer,
  CustomOption,
  Content,
  SectionListWrapper,
  SectionListItem,
  Title,
  FormChart,
  FormWrapper,
  ControlRange,
  DateRangeWrapper,
  Divider,
  ChartTable,
  PivotTable,
  ScrollWrapper,
  MultiValue,
  MultiValueContent,
  ValueOption,
  OptionLabel,
  Checkbox
};