import React, { useCallback } from 'react';
import { useStore, getBezierPath } from 'reactflow';

import { getEdgeParams } from './utils';
import styled from 'styled-components';
interface CustomEdgeProps {
  id: string;
  source: string;
  target: string;
  markerEnd?: string;
  style?: React.CSSProperties;
}

const CustomEdge = styled.path`
  .simple-floatingedges {
    flex-direction: column;
    display: flex;
    flex-grow: 1;
    height: 100%;
  }

  .simple-floatingedges .react-flow__handle {
    width: 8px;
    height: 8px;
    background-color: #bbb;
  }

  .simple-floatingedges .react-flow__handle-top {
    top: -15px;
  }

  .simple-floatingedges .react-flow__handle-bottom {
    bottom: -15px;
  }

  .simple-floatingedges .react-flow__handle-left {
    left: -15px;
  }

  .simple-floatingedges .react-flow__handle-right {
    right: -15px;
  }

  .simple-floatingedges .react-flow__node-custom {
    background: #fff;
    border: 1px solid #1a192b;
    border-radius: 3px;
    color: #222;
    font-size: 12px;
    padding: 10px;
    text-align: center;
    width: 150px;
  }
`;

const Edge = ({ id, source, target, markerEnd, style }: CustomEdgeProps) => {
  const sourceNode = useStore(
    useCallback(store => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback(store => store.nodeInternals.get(target), [target])
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty
  });

  return (
    <CustomEdge
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      strokeWidth={5}
      markerEnd={markerEnd}
      style={style}
    />
  );
};

export default Edge;
