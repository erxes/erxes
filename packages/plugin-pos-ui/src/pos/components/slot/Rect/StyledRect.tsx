import React from 'react';
import styled from 'styled-components';

const _StyledRect: any = React.forwardRef(
  (props, ref?: React.Ref<HTMLDivElement>) => <div {...props} ref={ref} />
);

const StyledRect = styled(_StyledRect)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 500;

  .square,
  .resizable-handler,
  .rotate {
    display: none;
  }

  &.rect-active {
    &::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border: 2px solid #673fbd;
    }
    .square,
    .resizable-handler,
    .rotate {
      display: block;
    }

    .square {
      position: absolute;
      width: 7px;
      height: 7px;
      background: white;
      border-radius: 1px;
      box-shadow: 0 0 4px 1px rgba(57, 76, 96, 0.15),
        0 0 0 1px rgba(43, 59, 74, 0.3);
      border-radius: 3px;
      &.t,
      &.b {
        width: 16px;
        height: 6px;
      }
      &.tl,
      &.tr,
      &.bl,
      &.br {
        height: 12px;
        width: 12px;
        border-radius: 6px;
      }
      &.l,
      &.r {
        width: 6px;
        height: 16px;
      }
    }

    .resizable-handler {
      position: absolute;
      width: 16px;
      height: 16px;
      cursor: pointer;
      z-index: 1;

      &.tl,
      &.t,
      &.tr {
        top: -8px;
      }

      &.tl,
      &.l,
      &.bl {
        left: -8px;
      }

      &.bl,
      &.b,
      &.br {
        bottom: -8px;
      }

      &.br,
      &.r,
      &.tr {
        right: -8px;
      }

      &.l,
      &.r {
        margin-top: -8px;
      }

      &.t,
      &.b {
        margin-left: -8px;
      }
    }

    .rotate {
      position: absolute;
      left: 50%;
      top: -26px;
      width: 18px;
      height: 18px;
      margin-left: -9px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .t {
      top: -3px;
    }

    .tl,
    .tr {
      top: -6px;
    }

    .b {
      bottom: -3px;
    }

    .bl,
    .br {
      bottom: -6px;
    }

    .r {
      right: -3px;
    }

    .tr,
    .br {
      right: -6px;
    }

    .l {
      left: -3px;
    }

    .tl,
    .bl {
      left: -6px;
    }

    .l,
    .r {
      top: 50%;
      margin-top: -8px;
    }

    .t,
    .b {
      left: 50%;
      margin-left: -8px;
    }
  }
`;

export default StyledRect;
