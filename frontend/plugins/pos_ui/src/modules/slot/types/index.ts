export interface TableNodeData {
  label: string;
  color: string;
  width: number;
  height: number;
  positionX?: number;
  positionY?: number;
  rounded: boolean;
  rotateAngle: number;
  zIndex: number;
  disabled: boolean;
  code: string;
}

export interface CustomNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    code: string;
    color: string;
    width: number;
    height: number;
    positionX: number;
    positionY: number;
    rounded: boolean;
    rotateAngle: number;
    zIndex: number;
    disabled: boolean;
  };
  width?: number;
  height?: number;
}

export interface SlotDetailForm {
  name: string;
  code: string;
  rounded: boolean;
  width: string;
  height: string;
  top: string;
  left: string;
  rotateAngle: string;
  zIndex: string;
  color: string;
  disabled: boolean;
  label: string;
}

export interface TableNodeProps {
  id: string;
  data: TableNodeData;
  selected: boolean;
}
export interface ResizeEventDetail {
  id: string;
  width: number;
  height: number;
}

export interface NodeResizeEvent extends CustomEvent {
  detail: ResizeEventDetail;
}

export type TabValue = 'slots' | 'details';

export type SidebarViewType = 'list' | 'detail' | 'hidden';

export interface SidebarListProps {
  nodes: CustomNode[];
  onNodeSelect: (nodeId: string) => void;
  onAddNew: (nodeData?: Partial<TableNodeData>) => void;
}

export interface UseKeyboardShortcutsProps {
  selectedNode: CustomNode | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<CustomNode | null>>;
  isEditMode: boolean;
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  sidebarView: SidebarViewType;
  onDeleteNode: () => void;
  onSaveNode: () => void;
  onAddNode: () => void;
  onToggleSidebar: () => void;
}
export interface NodeControlsProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  selectedNode: CustomNode | null;
  onSave: () => void;
  onAdd: (nodeData?: Partial<TableNodeData>) => void;
  onDelete: (() => void) | undefined;
  onAddSlot: () => void;
  onArrangeNodes: () => void;
}

export interface MiniMapToggleProps {
  nodeStrokeWidth?: number;
  zoomable?: boolean;
  pannable?: boolean;
  position?: string;
}
export interface SidebarListProps {
  nodes: CustomNode[];
  selectedNode: CustomNode | null;
  onNodeClick: (event: React.MouseEvent, node: CustomNode) => void;
  onAddSlot: () => void;
  onDuplicateSlot: (id: string) => void;
  onDeleteSlot: (id: string) => void;
}

export interface SidebarDetailProps {
  onSave: () => void;
  onCancel: () => void;
}
export interface SlotCardProps {
  node: CustomNode;
  selected: boolean;
  onEdit: (node: CustomNode, event?: React.MouseEvent) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}
export interface SlotDetail {
  name: string;
  code: string;
  rounded: boolean;
  width: string;
  height: string;
  top: string;
  left: string;
  rotateAngle: string;
  zIndex: string;
  color: string;
  disabled: boolean;
  label: string;
}

export interface POSSlotsManagerProps {
  posId: string;
  initialNodes?: CustomNode[];
  onNodesChange?: (nodes: CustomNode[]) => void;
  isCreating?: boolean;
}

export interface NodeEventDetail {
  id: string;
  width?: number;
  height?: number;
  position?: { x: number; y: number };
  rotateAngle?: number;
}