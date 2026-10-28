import { useReactFlow, useStore } from '@xyflow/react';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  STRUCTURE_CANVAS_ANIMATION,
  STRUCTURE_CANVAS_FOCUS_ZOOM,
  STRUCTURE_CANVAS_NODE_HEIGHT,
  STRUCTURE_CANVAS_NODE_WIDTH,
  STRUCTURE_DRAWER_SPACE,
} from '../constants/structureCanvas';
import { useStructureWorkspace } from '../contexts/StructureWorkspaceContext';
import { structureFocusState } from '../states/structureViewState';
import { TStructureCanvasNode } from '../types/structureCanvas';

export const useStructureCanvasFocus = (
  nodes: TStructureCanvasNode[],
  ready: boolean,
) => {
  const { selectedId } = useStructureWorkspace();
  const [focusId, setFocusId] = useAtom(structureFocusState);
  const { getViewport, setCenter } = useReactFlow();
  const paneWidth = useStore((state) => state.width);
  const paneHeight = useStore((state) => state.height);
  const visibleWidth = selectedId
    ? paneWidth - STRUCTURE_DRAWER_SPACE
    : paneWidth;

  const center = useCallback(
    ({ position }: TStructureCanvasNode, zoom: number) =>
      setCenter(
        position.x +
          STRUCTURE_CANVAS_NODE_WIDTH / 2 +
          (paneWidth - visibleWidth) / 2 / zoom,
        position.y + STRUCTURE_CANVAS_NODE_HEIGHT / 2,
        { zoom, ...STRUCTURE_CANVAS_ANIMATION },
      ),
    [paneWidth, visibleWidth, setCenter],
  );

  useEffect(() => {
    const node = nodes.find(({ id }) => id === selectedId);

    if (!ready || !node || !paneWidth) {
      return;
    }

    const { x, y, zoom } = getViewport();
    const left = node.position.x * zoom + x;
    const top = node.position.y * zoom + y;
    const visible =
      left >= 0 &&
      top >= 0 &&
      left + STRUCTURE_CANVAS_NODE_WIDTH * zoom <= visibleWidth &&
      top + STRUCTURE_CANVAS_NODE_HEIGHT * zoom <= paneHeight;

    if (!visible) {
      center(node, zoom);
    }
  }, [ready, selectedId]);

  useEffect(() => {
    const node = nodes.find(({ id }) => id === focusId);

    if (!ready || !node || !paneWidth) {
      return;
    }

    center(node, Math.max(getViewport().zoom, STRUCTURE_CANVAS_FOCUS_ZOOM));
    setFocusId(null);
  }, [ready, focusId, nodes, paneWidth, center, getViewport, setFocusId]);
};
