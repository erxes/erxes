import { useAutomation } from '@/automations/context/AutomationProvider';
import { useReactFlowEditor } from '@/automations/hooks/useReactFlowEditor';
import {
  automationCanvasMarqueeModeState,
  automationCanvasViewState,
} from '@/automations/states/automationState';
import { SelectionMode } from '@xyflow/react';
import { useAtomValue } from 'jotai';

// Middle and right buttons pan while the left one draws a selection
const MARQUEE_PAN_BUTTONS = [1, 2];

/**
 * The builder canvas as React Flow props: editing handlers only while the
 * automation can change, and selecting by dragging in marquee mode.
 */
export const useAutomationBuilderCanvas = () => {
  const { isReadOnly } = useAutomation();
  const { showGrid, showMiniMap } = useAtomValue(automationCanvasViewState);
  const isMarqueeMode = useAtomValue(automationCanvasMarqueeModeState);
  const {
    theme,
    reactFlowWrapper,
    editorWrapper,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    isValidConnection,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    onDragOver,
    onNodeDrag,
    onNodeDragStop,
    setReactFlowInstance,
  } = useReactFlowEditor();

  return {
    theme,
    reactFlowWrapper,
    editorWrapper,
    showGrid,
    showMiniMap,
    isMarqueeMode,
    flowProps: {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect: isReadOnly ? undefined : onConnect,
      onDrop: isReadOnly ? undefined : onDrop,
      isValidConnection,
      onNodeClick,
      onNodeDoubleClick,
      onPaneClick,
      onNodeDrag: isReadOnly ? undefined : onNodeDrag,
      onNodeDragStop,
      onInit: setReactFlowInstance,
      onDragOver: isReadOnly ? undefined : onDragOver,
      selectionOnDrag: isMarqueeMode,
      panOnDrag: isMarqueeMode ? MARQUEE_PAN_BUTTONS : true,
      selectionMode: SelectionMode.Partial,
      nodesDraggable: !isReadOnly,
      nodesConnectable: !isReadOnly,
      deleteKeyCode: isReadOnly ? null : undefined,
    },
  };
};
