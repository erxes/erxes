import RGL, { WidthProvider } from 'react-grid-layout';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { FlexContent } from '@erxes/ui/src/layout/styles';

const ReactGridLayout = WidthProvider(RGL);

const DragField = styledTS<{ haveChart?: boolean }>(styled(ReactGridLayout))`
    background-image: radial-gradient(
      ${colors.bgActive} 20%,
      ${colors.colorWhite} 20%
    );
    ${props => (props.haveChart ? '' : 'height: 100% !important')};
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
`;
const FlexCenter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 20px;
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
  FlexCenter
};
