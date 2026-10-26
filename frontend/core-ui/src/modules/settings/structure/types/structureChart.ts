import { Edge, Node } from '@xyflow/react';

export type TStructureChartItem = {
  _id: string;
  title: string;
  code: string;
  parentId?: string;
  supervisorId?: string;
  userCount: number;
};

export type TStructureChartNodeData = TStructureChartItem & {
  childCount: number;
  // Descendants hidden because this node is collapsed; 0 when expanded
  hiddenCount: number;
};

export type TStructureChartNode = Node<TStructureChartNodeData, 'structure'>;

export type TStructureChartPlaceholderNode = Node<
  { parentId: string },
  'placeholder'
>;

export type TStructureChartFlowNode =
  | TStructureChartNode
  | TStructureChartPlaceholderNode;

export type TStructureChartEdge = Edge<
  {
    // Set on edges into a real child, which can take an insert between
    childCode?: string;
    isPlaceholder?: boolean;
  },
  'structure'
>;
