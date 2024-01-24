import RGL, { WidthProvider } from 'react-grid-layout';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { Contents, FlexContent } from '@erxes/ui/src/layout/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { RightMenuContainer } from '@erxes/ui-cards/src/boards/styles/rightMenu';

const ReactGridLayout = WidthProvider(RGL);

const DragField = styledTS<{ haveChart?: boolean }>(styled(ReactGridLayout))`
    background-image: radial-gradient(
      ${colors.bgActive} 20%,
      ${colors.colorWhite} 20%
    );
    ${(props) => (props.haveChart ? '' : 'height: 100% !important')};
    min-height: 100%;
    
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
`;

const CenterBar = styled.div`
  position: absolute;
  left: 40% !important;

  > div {
    height: 30px;
    border: 1px solid ${colors.borderDarker};
    border-radius: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

    width: fit-content;
    margin-left: auto;

    span {
      font-weight: 500;
      padding: 4px ${dimensions.coreSpacing}px;
      border-radius: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

      &.active {
        background: ${colors.colorSecondary};
        color: ${colors.colorWhite};

        &:before {
          content: none;
        }
      }
    }
  }

  @media (max-width: 1600px) {
    left: 30%;
  }
`;

const ActionBarButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: 1450px) {
    max-width: 350px;
    white-space: normal;
    text-align: right;
    margin-bottom: ${dimensions.unitSpacing}px;

    > button {
      margin-top: ${dimensions.unitSpacing - 5}px;
    }
  }
`;

const Title = styled(FlexContent)`
  transition: all ease 0.3s;
  padding: 0 ${dimensions.unitSpacing}px;
  border-radius: 4px;

  input {
    border: 0;
    font-size: 16px;
  }

  i {
    visibility: hidden;
  }

  &:hover {
    background: ${colors.bgActive};

    i {
      visibility: visible;
    }
  }
`;

const BackButton = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 35px;
  line-height: 35px;
  background: rgba(0, 0, 0, 0.12);
  text-align: center;
  margin-right: ${dimensions.unitSpacing}px;
  color: ${colors.textPrimary};
  transition: all ease 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.18);
  }
`;

const BoxContainer = styled.div`
  display: flex;
  padding: 10px;
  flex-wrap: wrap;

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

    h5 {
      opacity: 0.8;
    }
  }

  h5 {
    opacity: 0.4;
    font-weight: bold;
    font-size: 40px;
    line-height: 44px;
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
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormContentWrapper = styled.div`
  display: flex;

  align-items: stretch;

  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;

  overflow-y: auto;
`;

const ReportsSearchSection = styled.div`
  margin: 0 10px;
  padding: 20px;

  height: 100%;
  position: sticky;
  top: 0;
`;

const ReportsTemplatesSection = styled.div`
  display: block;
  flex: 1;
  margin: 10px;
  padding: 20px;
  overflow-y: auto;
`;
const FlexCenter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 10px;
`;

const MenuFooter = styled.footer`
  padding: 10px 20px;
`;

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${(props) => props.isActive && colors.bgActive};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
  a {
    white-space: normal;
    flex: 1;
    padding: 10px 0 10px 20px;
    font-weight: 500;
    &:hover {
      background: none;
    }
    &:focus {
      color: inherit;
      text-decoration: none;
    }
    > span {
      color: #666;
      font-weight: normal;
    }
  }
  &:last-child {
    border: none;
  }
  &:hover {
    cursor: pointer;
    background: ${(props) => !props.isActive && colors.bgLight};
    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const SideList = styledTS<{
  isActive?: boolean;
  level?: number;
}>(styled(SidebarListItem))`
  white-space: normal !important;
  border: 0;
  padding-left: ${(props) => `${(props.level || 0) * 30 + 20}px !important`};

  > span {
    width: 90%;
    display: flex;
    color: ${(props) => props.isActive && colors.colorPrimary};

    &:hover {
      color: ${(props) => !props.isActive && lighten(colors.textPrimary, 40)};
    }

    > i {
      margin-right: 5px;
      color: ${(props) =>
        props.isActive
          ? colors.colorPrimary
          : !props.level || props.level === 0
            ? colors.colorCoreBlue
            : colors.colorCoreGreen};
    }
  }

  &:hover {
    background: ${(props) => !props.isActive && colors.bgLight};
  }
`;

const ActionFooter = styled.div`
  padding: ${dimensions.unitSpacing}px;
  bottom: ${dimensions.coreSpacing}px;
`;

const FormContainer = styled.div`
  background-image: radial-gradient(
    ${colors.bgActive} 20%,
    ${colors.colorWhite} 20%
  );
  padding: 2rem;
  background-size: 10px 10px;
  height: 100% !important;
`;

const FormChart = styled.div`
  width: calc(100% - 500px);
  background: white;

  box-shadow: 1px 4px 16px rgba(141, 149, 166, 0.1);
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 2rem;
`;

const RightDrawerContainer = styled(RightMenuContainer)`
  background: ${colors.colorWhite};
  width: 500px;
  padding: ${dimensions.unitSpacing}px;
  z-index: 10;
`;

const Description = styled.div`
  margin: ${dimensions.coreSpacing}px ${dimensions.unitSpacing}px
    ${dimensions.unitSpacing}px;

  h4 {
    margin: 0;
    font-size: 16px;
  }

  > p {
    margin: ${dimensions.unitSpacing - 5}px 0 0 0;
    color: ${colors.colorCoreGray};
  }
`;

const ScrolledContent = styled.div`
  flex: 1;
  overflow: auto;
`;

const DrawerDetail = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

const ChartTitle = styled.div`
  display: flex
  align-items:center;
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
    font-weight:500; 
    display:none;
    cursor:pointer;
    margin-right: 0.5rem;
  }
  span:first-of-type {
    margin-left: auto;
    margin-right: 0.5rem;
    color: ${colors.colorPrimary}
  }
  span:last-of-type {
    color: ${colors.colorCoreRed}
  }
`;

const HeightedWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const ReportContainer = styled(Contents)`
  margin: 0;

  > section {
    margin: 0;
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DateName = styled.div`
  text-transform: uppercase;
  margin: ${dimensions.unitSpacing}px 0;
  text-align: center;
`;

const MarginY = styledTS<{ margin: number }>(styled.div)`
  margin: ${(props) => props.margin}px 0;
`;

export {
  DragField,
  CenterBar,
  ActionBarButtonsWrapper,
  Title,
  BackButton,
  BoxContainer,
  FlexColumn,
  FormContentWrapper,
  ReportsSearchSection,
  ReportsTemplatesSection,
  FlexCenter,
  MenuFooter,
  SideList,
  ActionFooter,
  FormContainer,
  FormChart,
  RightDrawerContainer,
  Description,
  ScrolledContent,
  DrawerDetail,
  ChartTitle,
  HeightedWrapper,
  ReportContainer,
  FlexRow,
  DateName,
  MarginY,
};
