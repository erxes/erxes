import { colors } from '@erxes/ui/src/styles';
import RGL, { WidthProvider } from 'react-grid-layout';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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

export { DragField };
