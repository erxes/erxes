import { useEffect, useRef } from 'react';
import { useSidePanel } from 'ui-modules';

/**
 * Closes the side panel when the deals page switches to another board or
 * pipeline. Filling an empty board or pipeline (the page's first load, a
 * minimized deal page, a legacy link) keeps it open.
 */
export const useCloseSidePanelOnPipelineChange = (
  boardId: string | null,
  pipelineId: string | null,
) => {
  const { open, close } = useSidePanel();
  const previous = useRef({ boardId, pipelineId });
  const latest = useRef({ open, close });
  latest.current = { open, close };

  useEffect(() => {
    const changed = (before: string | null, after: string | null) =>
      Boolean(before) && before !== after;
    const { boardId: lastBoardId, pipelineId: lastPipelineId } =
      previous.current;
    previous.current = { boardId, pipelineId };

    if (
      (changed(lastBoardId, boardId) || changed(lastPipelineId, pipelineId)) &&
      latest.current.open
    ) {
      latest.current.close();
    }
  }, [boardId, pipelineId]);
};
