import type { Edge, Node } from '@xyflow/react';
import type { TStructureTreeEntity } from './structureEntity';

export type TStructureCanvasCardData = {
  entity: TStructureTreeEntity;
  depth: number;
  childCount: number;
  expanded: boolean;
  hiddenLabel?: string;
};

export type TStructureCanvasCardNode = Node<TStructureCanvasCardData, 'card'>;

export type TStructureCanvasDraftNode = Node<{ parentId: string }, 'draft'>;

export type TStructureCanvasNode =
  | TStructureCanvasCardNode
  | TStructureCanvasDraftNode;

export type TStructureCanvasEdge = Edge<{ compact: boolean }, 'structure'>;
