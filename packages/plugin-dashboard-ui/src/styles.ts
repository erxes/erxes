import { PageHeader } from '@erxes/ui-cards/src/boards/styles/header';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { Contents, FlexContent } from '@erxes/ui/src/layout/styles';
import { RightMenuContainer } from '@erxes/ui-cards/src/boards/styles/rightMenu';
import RGL, { WidthProvider } from 'react-grid-layout';
const ReactGridLayout = WidthProvider(RGL);

const Header = styled(PageHeader)`
  min-height: auto;
`;

export const RightDrawerContainer = styled(RightMenuContainer)`
  background: ${colors.colorWhite};
  width: 500px;
  padding: ${dimensions.unitSpacing}px;
  z-index: 10;
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
const RightActions = styled.div`
  align-self: center;

  a {
    margin-left: ${dimensions.unitSpacing}px;
  }

  button {
    margin: ${dimensions.unitSpacing}px 0;
  }
`;

const Dashboards = styled.ul`
  padding: 0;
  min-width: 280px;
  max-height: 75vh;
  overflow: auto;
  margin: -8px 0 0 0;

  > li {
    border-color: rgba(0, 0, 0, 0.06);

    button {
      font-size: 14px;
      padding: 0;
      margin-left: 5px;

      i {
        color: ${colors.colorSecondary};
      }
    }

    > a {
      padding: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px 20px;
      white-space: normal;

      &:hover {
        background: transparent;
      }
    }

    &:hover {
      background: ${rgba(colors.colorPrimary, 0.1)};
    }
  }
`;

const Create = styled.div`
  padding: 8px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: -8px;
  font-weight: 500;
  color: ${colors.colorSecondary};

  &:hover {
    cursor: pointer;
    background: ${rgba(colors.colorPrimary, 0.1)};
  }
`;

const SelectMemberStyled = styledTS<{ zIndex?: number }>(styled.div)`
position: relative;
  z-index: ${props => (props.zIndex ? props.zIndex : '2001')};
`;

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${props => props.isActive && colors.bgActive};
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
    background: ${props => !props.isActive && colors.bgLight};
    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const EmptyContent = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > img {
    width: 300px;
  }

  p {
    text-align: center;
    max-width: 400px;

    b {
      margin: ${dimensions.unitSpacing}px 0;
      display: block;
    }
  }
`;

const DashboardFormContainer = styled(Contents)`
  margin: 0;

  > section {
    margin: 0;
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

const ActionBarButtonsWrapper = styled.div`
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

const FormChart = styled.div`
  width: calc(100% - 500px);
  background: white;

  box-shadow: 1px 4px 16px rgba(141, 149, 166, 0.1);
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 2rem;
`;

const SelectChartType = styled.div`
  width: 200px;
  .Select-clear {
    display: none;
  }
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

const DragField = styledTS<{ haveChart?: boolean }>(styled(ReactGridLayout))`
    background-image: radial-gradient(
      ${colors.bgActive} 20%,
      ${colors.colorWhite} 20%
    );
    ${props => (props.haveChart ? '' : 'height: 100% !important')};
    min-height: 100%;
    
    background-size: 10px 10px
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

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${dimensions.coreSpacing}px;

  > div {
    margin: 0 ${dimensions.unitSpacing}px;
  }

  > span {
    font-weight: 500;

    &.active {
      color: ${colors.colorCoreGray};
    }
  }
`;

const CenterBar = styled.div`
  position: absolute;
  left: 40%;

  > div {
    height: 30px;
    border: 1px solid ${colors.borderDarker};
    border-radius: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

    span {
      font-weight: 500;
      padding: 4px ${dimensions.coreSpacing}px;
      border-radius: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

      &.public {
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

const ActionFooter = styled.div`
  padding: ${dimensions.unitSpacing}px;
  bottom: ${dimensions.coreSpacing}px;
`;

const Number = styled.div`
  display: flex;
  justify-content: center;
  font-size: 50px;
  height: 100%;
  align-items: center;
`;

const ChartTable = styled.div`
  overflow-y: auto;
  height: 90%;
  width: 100%;
  display: block;
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

export {
  ChartTitle,
  ChartTable,
  Number,
  ActionFooter,
  CenterBar,
  ToggleWrapper,
  Description,
  DrawerDetail,
  ScrolledContent,
  DragField,
  ActionBarButtonsWrapper,
  DashboardFormContainer,
  BackButton,
  Title,
  RightActions,
  Dashboards,
  Create,
  Header,
  SelectMemberStyled,
  SidebarListItem,
  EmptyContent,
  FormChart,
  FormContainer,
  SelectChartType
};
