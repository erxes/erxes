import { useReactFlow, useStore } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import { CARD_HEIGHT, CARD_WIDTH, type ChartNode, draftNodeId } from './chartLayout';
import { useWorkspace } from './context';

/** How much of the chart's width the unit panel covers, with its margin. */
const PANEL_SPACE = 464;
export const ANIMATION = { duration: 300 };
export const FIT_VIEW = { padding: 0.2, maxZoom: 1 };

/**
 * Pans to the focused unit (a search pick, a path click, the new-unit card) once it is drawn,
 * brings a newly selected card into view when it sits under the panel or off screen, and fits
 * the chart when the page menu asks. Panning by hand never snaps back.
 */
export const useChartFocus = (nodes: ChartNode[], ready: boolean) => {
  const { selectedId, focusId, clearFocus, draftParentId, fitRequest } = useWorkspace();
  const { getViewport, setCenter, fitView } = useReactFlow();
  const paneWidth = useStore((state) => state.width);
  const paneHeight = useStore((state) => state.height);
  const visibleWidth = selectedId ? paneWidth - PANEL_SPACE : paneWidth;
  const latest = useRef({ nodes, paneWidth, paneHeight, visibleWidth, clearFocus });

  useEffect(() => {
    latest.current = { nodes, paneWidth, paneHeight, visibleWidth, clearFocus };
  });

  const center = useRef((node: ChartNode, zoom: number) => {
    const current = latest.current;

    void setCenter(
      node.position.x + CARD_WIDTH / 2 + (current.paneWidth - current.visibleWidth) / 2 / zoom,
      node.position.y + CARD_HEIGHT / 2,
      { zoom, ...ANIMATION },
    );
  });

  useEffect(() => {
    if (ready && fitRequest) void fitView({ ...FIT_VIEW, ...ANIMATION });
  }, [ready, fitRequest, fitView]);

  useEffect(() => {
    const current = latest.current;
    const node = current.nodes.find(({ id }) => id === selectedId);

    if (!ready || !node || !current.paneWidth) return;

    const { x, y, zoom } = getViewport();
    const left = node.position.x * zoom + x;
    const top = node.position.y * zoom + y;

    const inSight =
      left >= 0 &&
      top >= 0 &&
      left + CARD_WIDTH * zoom <= current.visibleWidth &&
      top + CARD_HEIGHT * zoom <= current.paneHeight;

    if (!inSight) center.current(node, zoom);
  }, [ready, selectedId, getViewport]);

  const target = focusId ?? (draftParentId ? draftNodeId(draftParentId) : null);
  const targetNode = nodes.find(({ id }) => id === target);
  const targetAt = targetNode ? `${targetNode.position.x},${targetNode.position.y}` : null;

  useEffect(() => {
    const node = latest.current.nodes.find(({ id }) => id === target);

    if (!ready || !node || !targetAt || !latest.current.paneWidth) return;

    center.current(node, Math.max(getViewport().zoom, 0.9));

    if (focusId) latest.current.clearFocus();
  }, [ready, focusId, target, targetAt, getViewport]);
};
