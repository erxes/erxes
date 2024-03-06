import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import RGL, { WidthProvider } from 'react-grid-layout';

import { ContentBox, Contents } from '@erxes/ui/src/layout/styles';
import { RightMenuContainer } from '@erxes/ui-cards/src/boards/styles/rightMenu';
import { lighten, rgba } from '@erxes/ui/src/styles/ecolor';
import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { colors, dimensions } from '@erxes/ui/src/styles';

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

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    cursor: se-resize;
  }

  .react-grid-item > .react-resizable-handle::after {
    content: "";
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(0, 0, 0, 0.4);
    border-bottom: 2px solid rgba(0, 0, 0, 0.4);
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

  > div {
    > label {
      margin-bottom: 5px;
    }

    .Select-control {
      margin-bottom: 7px;
      border: 1px solid #eee;
      border-radius: 5px;

      .Select-value,
      .Select-placeholder,
      .Select-input {
        margin-left: 5px;

        input {
          border: none;
        }
      }
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
};
