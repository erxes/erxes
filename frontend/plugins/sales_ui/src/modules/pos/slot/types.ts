import type { Node } from '@xyflow/react';

export type SlotNodeData = {
  name: string;
  code: string;
  color: string;
  rounded: number;
  rotateAngle: number;
  option: Record<string, unknown>;
};

export type SlotNode = Node<SlotNodeData, 'slot'>;

export type SlotNodePatch = {
  name?: string;
  color?: string;
  rounded?: number;
  rotateAngle?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  zIndex?: number;
};
