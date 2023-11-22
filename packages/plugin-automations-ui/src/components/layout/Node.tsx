import { colors, dimensions } from '@erxes/ui/src';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import React from 'react';
import { Handle, Position } from 'reactflow';
import styledTS from 'styled-components-ts';

import styled from 'styled-components';

const Trigger = styledTS<{ type: string }>(styled.div)`
  max-width: 300px;
  padding: 3px;
  background: #f5f5f5;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  cursor: pointer;

  .header {
    background: ${props =>
      props.type === 'trigger'
        ? rgba(colors.colorPrimary, 0.12)
        : rgba(colors.colorCoreOrange, 0.12)};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    padding: ${dimensions.unitSpacing}px;

    > div {
      display: flex;
      align-items: center;
      margin-right: ${dimensions.coreSpacing}px;

      > i {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        font-size: 24px;
        line-height: 40px;
        text-align: center;
        flex-shrink: 0;
        margin-right: ${dimensions.unitSpacing}px;
        background: ${colors.colorWhite};
        color: ${props =>
          props.type === 'trigger'
            ? `${colors.colorCoreOrange} !important`
            : colors.colorSecondary};
      }
    }
  }

  > p {
    font-size: 13px;
    text-align: center;
    margin: 0;
    padding: ${dimensions.unitSpacing + 5}px ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
  }

  &.scratch {
    top: 40%;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 20px 10px 10px;
    transition: all ease 0.3s;

    > i {
      width: 40px;
      height: 40px;
      line-height: 40px;
      background: ${rgba(colors.colorSecondary, 0.12)};
      border-radius: 40px;
      color: ${colors.colorSecondary};
      text-align: center;
    }

    &:hover {
      border-color: ${colors.colorSecondary};
    }
  }
`;

interface CustomNodeProps {
  data: any;
}

const CustomNode = ({ data }: CustomNodeProps) => {
  return (
    <Trigger type={data.type}>
      <div className="header">
        {data.label}
        <i className={`icon-${data.icon}`}></i>
      </div>
      <p>{data.description}</p>
      <Handle type="source" position={Position.Top} id="a" />
      <Handle type="source" position={Position.Right} id="b" />
      <Handle type="source" position={Position.Bottom} id="c" />
      <Handle type="source" position={Position.Left} id="d" />
    </Trigger>
  );
};

export default CustomNode;
