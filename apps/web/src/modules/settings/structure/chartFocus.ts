import { useReactFlow, useStore } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import { type ChartNode, draftNodeId } from './chartLayout';
import { useWorkspace } from './context';

export const ANIMATION = { duration: 300 };
const FIT_VIEW = { padding: 0.2, maxZoom: 1 };

/** The zoom a card is brought to when the view is zoomed out too far to read it. */
const READABLE_ZOOM = 0.9;

type View = { x: number; y: number; zoom: number };

/** Whether the whole card shows in a pane of this size at this view. */
const inSight = (node: ChartNode, view: View, pane: { width: number; height: number }) => {
  const left = node.position.x * view.zoom + view.x;
  const top = node.position.y * view.zoom + view.y;

  return (
    left >= 0 &&
    top >= 0 &&
    left + node.width * view.zoom <= pane.width &&
    top + node.height * view.zoom <= pane.height
  );
};

/**
 * Moves the view only when it has to. A unit picked from search or the path is centred once it
 * is drawn. A newly selected card, and the new-unit card, are brought in only when they sit off
 * screen, at the zoom the view already has: a card in sight leaves the view where it is. The chart
 * fits the screen when the page menu asks, and panning by hand never snaps back.
 */
export const useChartFocus = (nodes: ChartNode[], ready: boolean) => {
  const { selectedId, focusId, clearFocus, draftParentId, fitRequest } = useWorkspace();
  const { getViewport, setCenter, fitView } = useReactFlow();
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);
  const latest = useRef({ nodes, width, height, clearFocus });

  useEffect(() => {
    latest.current = { nodes, width, height, clearFocus };
  });

  /** Centres a drawn card, at `zoom` or the view's own; `onlyIfHidden` leaves one in sight alone. */
  const show = useRef((id: string | null, onlyIfHidden: boolean, zoom?: number) => {
    const current = latest.current;
    const node = current.nodes.find((drawn) => drawn.id === id);
    const view = getViewport();

    if (!node || !current.width || (onlyIfHidden && inSight(node, view, current))) return false;

    void setCenter(node.position.x + node.width / 2, node.position.y + node.height / 2, {
      zoom: zoom ?? view.zoom,
      ...ANIMATION,
    });

    return true;
  });

  /** Where a card is drawn, so an effect runs again once it is drawn or has moved. */
  const placeOf = (id: string | null) => {
    const node = nodes.find((drawn) => drawn.id === id);

    return node ? `${node.position.x},${node.position.y}` : null;
  };

  useEffect(() => {
    if (ready && fitRequest) void fitView({ ...FIT_VIEW, ...ANIMATION });
  }, [ready, fitRequest, fitView]);

  useEffect(() => {
    if (ready) show.current(selectedId, true);
  }, [ready, selectedId]);

  const focusedAt = placeOf(focusId);

  useEffect(() => {
    if (!ready || !focusedAt) return;

    if (show.current(focusId, false, Math.max(getViewport().zoom, READABLE_ZOOM)))
      latest.current.clearFocus();
  }, [ready, focusId, focusedAt, getViewport]);

  const draftId = draftParentId ? draftNodeId(draftParentId) : null;
  const draftAt = placeOf(draftId);

  useEffect(() => {
    if (ready && draftAt) show.current(draftId, true);
  }, [ready, draftId, draftAt]);
};
